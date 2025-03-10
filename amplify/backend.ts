import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import * as cdk from 'aws-cdk-lib';
import { myApiFunction } from './function/api-function/resource';

export const backend = defineBackend({
  auth,
  data,
  myApiFunction,
});

const livenessStack = backend.createStack("liveness-stack");

const livenessPolicy = new cdk.aws_iam.Policy(livenessStack, "LivenessPolicy", {
  statements: [
    new cdk.aws_iam.PolicyStatement({
      actions: ["rekognition:StartFaceLivenessSession"],
      resources: ["*"],
    }),
  ],
});
backend.auth.resources.unauthenticatedUserIamRole.attachInlinePolicy(livenessPolicy); // allows guest user access
backend.auth.resources.authenticatedUserIamRole.attachInlinePolicy(livenessPolicy); // allows logged in user access


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

// create a new resource path with IAM authorization
const itemsPath = myRestApi.root.addResource("items", {
});

// add methods you would like to create to the resource path
itemsPath.addMethod("GET", lambdaIntegration);
itemsPath.addMethod("POST", lambdaIntegration);
itemsPath.addMethod("DELETE", lambdaIntegration);
itemsPath.addMethod("PUT", lambdaIntegration);

// add a proxy resource path to the API
itemsPath.addProxy({
  anyMethod: true,
  defaultIntegration: lambdaIntegration,
});

// create a new IAM policy to allow Invoke access to the API
const apiRestPolicy = new cdk.aws_iam.Policy(apiStack, "RestApiPolicy", {
  statements: [
    new cdk.aws_iam.PolicyStatement({
      actions: ["execute-api:Invoke"],
      resources: [
        `${myRestApi.arnForExecuteApi("*", "/items", "dev")}`,
        `${myRestApi.arnForExecuteApi("*", "/items/*", "dev")}`,
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
  },
});