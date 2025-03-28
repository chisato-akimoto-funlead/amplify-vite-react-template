import type { APIGatewayProxyHandler } from "aws-lambda";
import AWS from 'aws-sdk';

const rekognition = new AWS.Rekognition({region: "ap-northeast-1"});

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log("event", event);
  const hoge = event.queryStringParameters;
  if (!hoge){
    throw "error";
  }


  try {
    const response = await rekognition.getFaceLivenessSessionResults({
      SessionId: hoge.sessionId ?? "",
    }).promise();
    if(!response.Confidence){
      throw "error";
    }
    const isLive = response.Confidence > 90;
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Restrict this to domains you trust
        "Access-Control-Allow-Headers": "*", // Specify only the headers you need to allow
      },
      body: JSON.stringify({ isLive }),
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