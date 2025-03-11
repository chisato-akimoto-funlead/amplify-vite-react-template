import type { APIGatewayProxyHandler } from "aws-lambda";
import AWS from 'aws-sdk';

const rekognition = new AWS.Rekognition({region: "ap-northeast-1"});
const s3Client = new AWS.S3({region: "ap-northeast-1"});

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
    const s3peg = await s3Client.getObject({
      Bucket: "liveness-bucket-test-face-cheker ",
      Key:
        "my-prefix/a6d5a03e-97db-494c-a65b-62b4c6552285/reference.jpg",
    }).promise();
    console.log(s3peg);
    const compare = await rekognition.compareFaces({
      SourceImage: {
        Bytes: Buffer.from(
          new Uint8Array(s3peg.Body as ArrayBuffer)
        ),
      },
      TargetImage: {
        Bytes: Buffer.from(
          imageData.replace("data:image/jpeg;base64,", ""),
          "base64"
        ),
      },
    }).promise();
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Restrict this to domains you trust
        "Access-Control-Allow-Headers": "*", // Specify only the headers you need to allow
      },
      body: JSON.stringify({ result, compare }),
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