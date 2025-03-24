import * as faceapi from "face-api.js";
import * as tf from "@tensorflow/tfjs";

let modelsLoaded = false;

export async function loadFaceDetectionModels() {
  if (modelsLoaded) return;

  try {
    // Load only necessary models
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
    ]);
    modelsLoaded = true;
  } catch (error) {
    console.error("Error loading face detection models:", error);
    throw new Error("Failed to load face detection models. Please check the console for details.");
  }
}

export async function setup () {
  
  await tf.setBackend('webgl');  // バックエンドを明示的に設定
  await tf.ready();  // 初期化完了を待つ
}

export async function detectFaces(videoElement: HTMLVideoElement) {
  if (!modelsLoaded) {
    throw new Error("Face detection models not loaded");
  }

  try {
    // Use TinyFaceDetector with minimal settings
    const detections = await faceapi
      .detectAllFaces(
        videoElement,
        new faceapi.TinyFaceDetectorOptions({
          inputSize: 320,
          scoreThreshold: 0.3
        })
      );

    console.log("Face detection result:", detections.length > 0 ? "Face detected" : "No face detected");
    return detections;
  } catch (error) {
    console.error("Face detection error:", error);
    throw new Error("Face detection failed");
  }
}