import { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import {
  DetectFacesRequest,
  DetectFacesResponse,
  FaceDetailList,
} from "aws-sdk/clients/rekognition";
import AWS from "aws-sdk";
import { ThemeProvider } from "@aws-amplify/ui-react";

function S3() {

  const videoConstraints = {
    width: 720,
    height: 360,
    facingMode: "user",
  };
  
  // AWS.config.update({
  //   accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  //   secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  //   region: process.env.REACT_APP_AWS_REGION,
  // });
  
  const rekognitionClient = new AWS.Rekognition({
    apiVersion: "2016-06-27",
  });
  
  //Amazon Rekognitionによる顔分析
  const detectFaces = async (imageData: string): Promise<DetectFacesResponse> => {
    const params: DetectFacesRequest = {
      Image: {
        Bytes: Buffer.from(
          imageData.replace("data:image/jpeg;base64,", ""),
          "base64"
        ),
      },
      Attributes: ["ALL"],
    };
    return await rekognitionClient.detectFaces(params).promise();
  };
  
  //分析結果からConfidence（分析結果の信頼度）取得
  const getConfidence = (rekognizeResult: DetectFacesResponse): number => {
    return (rekognizeResult.FaceDetails as FaceDetailList)[0].Confidence!;
  };
  
  //分析結果からLowAge（推測される年齢範囲の加減）取得
  const getLowAge = (rekognizeResult: DetectFacesResponse): number => {
    return (rekognizeResult.FaceDetails as FaceDetailList)[0].AgeRange?.Low!;
  };
  
  //分析結果からHighAge（推測される年齢範囲の上限）取得
  const getHighAge = (rekognizeResult: DetectFacesResponse): number => {
    return (rekognizeResult.FaceDetails as FaceDetailList)[0].AgeRange?.High!;
  };
  
  //分析結果からEyeglasses（眼鏡を掛けているか）取得
  const getIsWearingEyeGlasses = (
    rekognizeResult: DetectFacesResponse
  ): boolean => {
    return (rekognizeResult.FaceDetails as FaceDetailList)[0].Eyeglasses?.Value!;
  };
  
  //分析結果からEyeglasses（サングラスを掛けているか）取得
  const getIsWearingSunGlasses = (
    rekognizeResult: DetectFacesResponse
  ): boolean => {
    return (rekognizeResult.FaceDetails as FaceDetailList)[0].Sunglasses?.Value!;
  };
  const [isCaptureEnable, setCaptureEnable] = useState<boolean>(false);
  const webcamRef = useRef<Webcam>(null);
  const [url, setUrl] = useState<string | null>(null);
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setUrl(imageSrc);
      setRekognizeResult(undefined);
    }
  }, [webcamRef]);

  const [rekognizeResult, setRekognizeResult] = useState<DetectFacesResponse>();
  const rekognizeHandler = async () => {
    const result: DetectFacesResponse = await detectFaces(url as string);
    setRekognizeResult(result);
    console.log(result);
  };
  return (
    <>
    <ThemeProvider>
      <header>
        <h1>カメラアプリ（顔分析付き）</h1>
      </header>
      {isCaptureEnable || (
        <button onClick={() => setCaptureEnable(true)}>開始</button>
      )}
      {isCaptureEnable && (
        <>
          <div>
            <button onClick={() => setCaptureEnable(false)}>終了</button>
          </div>
          <div>
            <Webcam
              audio={false}
              width={540}
              height={360}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              style={{       
                position: "absolute",
                top: "0px",
                left: "0px",
                visibility: "hidden" }}
            />
          </div>
          <button onClick={capture}>キャプチャ</button>
        </>
      )}
      {url && (
        <>
          <div>
            <button
              onClick={() => {
                setUrl(null);
                setRekognizeResult(undefined);
              }}
            >
              削除
            </button>
            <button onClick={() => rekognizeHandler()}>分析</button>
          </div>
          <div>
            <img src={url} alt="Screenshot" />
          </div>
          {typeof rekognizeResult !== "undefined" && (
            <div style={{      
              flex: 1,
              width: "100%",
              flexDirection: "row",
              justifyContent: "flex-start"
              }}>
              <div>{"Confidence: " + getConfidence(rekognizeResult)}</div>
              <div>
                {"AgeRange: " +
                  getLowAge(rekognizeResult) +
                  " ~ " +
                  getHighAge(rekognizeResult)}
              </div>
              <div>
                {"Eyeglasses: " + getIsWearingEyeGlasses(rekognizeResult)}
              </div>
              <div>
                {"Sunglasses: " + getIsWearingSunGlasses(rekognizeResult)}
              </div>
            </div>
          )}
        </>
      )}
    </ThemeProvider>
    </>
  );
}

export default S3;
