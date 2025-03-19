import { useEffect, useState } from "react";
import { Card, CardContent } from "./components/ui/card";
import { useToast } from "./hooks/use-toast";
import { loadFaceDetectionModels } from "./lib/face-detection";
import { Loader2 } from "lucide-react";
import CameraView from "./components/camera-view";

export default function Face() {
  const [isModelLoading, setIsModelLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadFaceDetectionModels()
      .then(() => {
        setIsModelLoading(false);
      })
      .catch((error: { message: any; }) => {
        toast({
          variant: "destructive",
          title: "Error loading face detection models",
          description: error.message
        });
      });
  }, [toast]);

  if (isModelLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <h2 className="text-xl font-semibold">Loading Face Detection Models...</h2>
              <p className="text-sm text-muted-foreground text-center">
                Please wait while we load the necessary models for face detection
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <CameraView />;
}
