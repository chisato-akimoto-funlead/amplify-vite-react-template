import type { APIGatewayProxyHandler } from "aws-lambda";
import AWS from 'aws-sdk';

const rekognition = new AWS.Rekognition({region: "us-east-1"});

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log("event", event);

  try {
    const response = await rekognition.createFaceLivenessSession({
      Settings: {
        OutputConfig: {
          S3Bucket: "liveness-bucket-test-face-cheker",
          S3KeyPrefix: "my-prefix",
        }
      }
    }).promise();
    const sessionId = response.SessionId; // Adjust based on the actual response structure

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Restrict this to domains you trust
        "Access-Control-Allow-Headers": "*", // Specify only the headers you need to allow
      },
      body: JSON.stringify({ sessionId }),
    };
  } catch (error) {
    console.error("Error calling Rekognition", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
      },
      body: JSON.stringify({ error: "Failed to get session ID from Rekognition" }),
    };
  }
};