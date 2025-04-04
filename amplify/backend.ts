import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import * as cdk from 'aws-cdk-lib';
import { myApiFunction } from './function/api-function/resource';
import { getSessionResults } from './function/get-session-results/resource';
import { getDetect } from './function/get-detect/resource';

export const backend = defineBackend({
  auth,
  data,
  myApiFunction,
  getSessionResults,
  getDetect
});

const livenessStack = backend.createStack("liveness-stack");

const livenessPolicy = new cdk.aws_iam.Policy(livenessStack, "LivenessPolicy", {
  statements: [
    new cdk.aws_iam.PolicyStatement({
      actions: ["rekognition:StartFaceLivenessSession",
      "rekognition:CreateFaceLivenessSession",
      "rekognition:GetFaceLivenessSessionResults",
      "rekognition:*",
      "s3:*"],
      resources: ["*"],
    }),
  ],
});
backend.auth.resources.unauthenticatedUserIamRole.attachInlinePolicy(livenessPolicy); // allows guest user access
backend.auth.resources.authenticatedUserIamRole.attachInlinePolicy(livenessPolicy); // allows logged in user access
backend.myApiFunction.resources.lambda.addToRolePolicy(new cdk.aws_iam.PolicyStatement({
  actions: ["rekognition:StartFaceLivenessSession",
  "rekognition:CreateFaceLivenessSession",
  "rekognition:GetFaceLivenessSessionResults",
  "s3:*"
],
  resources: ["*"],
}),
); // allows lambda access
backend.getSessionResults.resources.lambda.addToRolePolicy(new cdk.aws_iam.PolicyStatement({
  actions: ["rekognition:StartFaceLivenessSession",
  "rekognition:CreateFaceLivenessSession",
  "rekognition:GetFaceLivenessSessionResults",
  "s3:*"
],
  resources: ["*"],
}),
); // allows lambda access

backend.getDetect.resources.lambda.addToRolePolicy(new cdk.aws_iam.PolicyStatement({
  actions: ["rekognition:StartFaceLivenessSession",
  "rekognition:CreateFaceLivenessSession",
  "rekognition:GetFaceLivenessSessionResults",
  "rekognition:*",
  "s3:*"
],
  resources: ["*"],
}),
); // allows lambda access

const bucket = new cdk.aws_s3.Bucket(livenessStack, `livenessBucket`, {
  bucketName: 'liveness-bucket-test-face-cheker', // なんか適当に決める
  removalPolicy: cdk.RemovalPolicy.DESTROY, // 検証用なのでformation削除時に一緒に掃除したい
});


const modelbucket = new cdk.aws_s3.Bucket(livenessStack, `modelBucket`, {
  bucketName: 'model-bucket-test-face-cheker', // なんか適当に決める
  removalPolicy: cdk.RemovalPolicy.DESTROY, // 検証用なのでformation削除時に一緒に掃除したい
});

new cdk.aws_s3_deployment.BucketDeployment(livenessStack, 'DeployModels', {
  sources: [cdk.aws_s3_deployment.Source.asset('./amplify/dataset/models.zip')],
  destinationBucket: modelbucket
});


// create a new API stack
const apiStack = backend.createStack("api-stack");

// create a new REST API
const myRestApi = new cdk.aws_apigateway.RestApi(apiStack, "RestApi", {
  restApiName: "myRestApi",
  deploy: true,
  deployOptions: {
    stageName: "dev",
  },
  defaultCorsPreflightOptions: {
    allowOrigins: cdk.aws_apigateway.Cors.ALL_ORIGINS, // Restrict this to domains you trust
    allowMethods: cdk.aws_apigateway.Cors.ALL_METHODS, // Specify only the methods you need to allow
    allowHeaders: cdk.aws_apigateway.Cors.DEFAULT_HEADERS, // Specify only the headers you need to allow
  },
});

// create a new Lambda integration
const lambdaIntegration = new cdk.aws_apigateway.LambdaIntegration(
  backend.myApiFunction.resources.lambda
);
const getSessionResult = new cdk.aws_apigateway.LambdaIntegration(
  backend.getSessionResults.resources.lambda
);
const getDetec = new cdk.aws_apigateway.LambdaIntegration(
  backend.getDetect.resources.lambda
);

// create a new resource path with IAM authorization
const itemsPath = myRestApi.root.addResource("items", {
});
const itemsPath2 = myRestApi.root.addResource("getitems", {
});
const itemsPath3 = myRestApi.root.addResource("getDetect", {
});

// add methods you would like to create to the resource path
itemsPath.addMethod("GET", lambdaIntegration);
itemsPath.addMethod("POST", lambdaIntegration);
itemsPath.addMethod("DELETE", lambdaIntegration);
itemsPath.addMethod("PUT", lambdaIntegration);
itemsPath2.addMethod("GET", getSessionResult);
itemsPath3.addMethod("POST", getDetec);

// add a proxy resource path to the API
itemsPath.addProxy({
  anyMethod: true,
  defaultIntegration: lambdaIntegration,
});
itemsPath2.addProxy({
  anyMethod: true,
  defaultIntegration: getSessionResult,
});
itemsPath3.addProxy({
  anyMethod: true,
  defaultIntegration: getDetec,
});

// create a new IAM policy to allow Invoke access to the API
const apiRestPolicy = new cdk.aws_iam.Policy(apiStack, "RestApiPolicy", {
  statements: [
    new cdk.aws_iam.PolicyStatement({
      actions: ["execute-api:Invoke"],
      resources: [
        "*"
      ],
    }),
  ],
});

// attach the policy to the authenticated and unauthenticated IAM roles
backend.auth.resources.authenticatedUserIamRole.attachInlinePolicy(
  apiRestPolicy
);
backend.auth.resources.unauthenticatedUserIamRole.attachInlinePolicy(
  apiRestPolicy
);

// add outputs to the configuration file
backend.addOutput({
  custom: {
    API: {
      [myRestApi.restApiName]: {
        endpoint: myRestApi.url,
        region: cdk.Stack.of(myRestApi).region,
        apiName: myRestApi.restApiName,
      },
    },
    S3: {
      bucketName: bucket.bucketName,
    },
  },
});