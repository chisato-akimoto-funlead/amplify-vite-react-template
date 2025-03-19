import { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { detectFaces } from "../lib/face-detection";
import { useToast } from "../hooks/use-toast";
import { Camera, CameraOff } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";

export default function CameraView() {
  const webcamRef = useRef<Webcam>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const { toast } = useToast();
  const detectionIntervalRef = useRef<number>();

  const handleUserMedia = useCallback(() => {
    setIsCameraReady(true);
    setHasPermission(true);

    // Start face detection loop
    const detectFacesLoop = async () => {
      if (webcamRef.current) {
        const video = webcamRef.current.video;
        if (video) {
          try {
            const faces = await detectFaces(video);
            console.log("Detection loop running, faces found:", faces.length);
            if (faces.length > 0) {
              toast({
                title: "Hello!",
                description: "Face detected!",
                duration: 3000,
              });
            }
          } catch (error) {
            console.error("Face detection error:", error);
          }
        }
      }
      // Run detection every 500ms instead of 1000ms
      detectionIntervalRef.current = window.setTimeout(detectFacesLoop, 500);
    };

    detectFacesLoop();
  }, [toast]);

  const handleUserMediaError = useCallback((error: string | DOMException) => {
    setHasPermission(false);
    setIsCameraReady(false);
    toast({
      variant: "destructive",
      title: "Camera Error",
      description: error instanceof DOMException ? error.message : "Failed to access camera",
    });
  }, [toast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (detectionIntervalRef.current) {
        clearTimeout(detectionIntervalRef.current);
      }
    };
  }, []);

  if (hasPermission === false) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <CameraOff className="h-12 w-12 text-destructive" />
              <h2 className="text-xl font-semibold">Camera Access Required</h2>
              <p className="text-sm text-muted-foreground text-center">
                Please allow camera access to use face detection features
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-background">
      {!isCameraReady && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Camera className="h-12 w-12 animate-pulse text-primary" />
        </div>
      )}
      <Webcam
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        videoConstraints={{
          facingMode: "user",
        }}
        onUserMedia={handleUserMedia}
        onUserMediaError={handleUserMediaError}
        className={`w-full h-screen object-cover ${
          isCameraReady ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}