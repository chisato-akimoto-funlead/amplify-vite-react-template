import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import * as cdk from 'aws-cdk-lib'

export const backend = defineBackend({
  auth,
  data,
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