import type { APIGatewayProxyHandler } from "aws-lambda";
import AWS from 'aws-sdk';

const rekognition = new AWS.Rekognition({region: "ap-northeast-1"});

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log("event", event);
  const hoge = event.body;
  if (!hoge){
    throw "error";
  }
  const val = JSON.parse(hoge);
  const imageData = val.imageData ?? "";
  try {
    const params = {
      Image: {
        Bytes: Buffer.from(
          imageData.replace("data:image/jpeg;base64,", ""),
          "base64"
        ),
      },
      Attributes: ["ALL"],
    };
    const result =  await rekognition.detectFaces(params).promise();
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Restrict this to domains you trust
        "Access-Control-Allow-Headers": "*", // Specify only the headers you need to allow
      },
      body: JSON.stringify({ result }),
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