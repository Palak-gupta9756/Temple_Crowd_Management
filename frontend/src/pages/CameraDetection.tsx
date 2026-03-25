import { useEffect, useRef, useState, useCallback } from "react";
import * as faceapi from "face-api.js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { temples } from "@/data/temples";
import { Camera, CameraOff, Users, Send, Activity, Loader2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function CameraDetection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<number | null>(null);

  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [selectedTemple, setSelectedTemple] = useState<string>("");
  const [faceCount, setFaceCount] = useState(0);
  const [isDetecting, setIsDetecting] = useState(false);
  const [autoSend, setAutoSend] = useState(false);
  const [lastSentTime, setLastSentTime] = useState<Date | null>(null);
  const [crowdStatus, setCrowdStatus] = useState<string>("");

  // Load face detection models
  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsLoading(true);
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        setIsModelLoaded(true);
        toast({
          title: "Models Loaded",
          description: "Face detection is ready",
        });
      } catch (error) {
        console.error("Error loading models:", error);
        toast({
          title: "Model Load Failed",
          description: "Could not load face detection models",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadModels();

    return () => {
      stopCamera();
    };
  }, []);

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsCameraOn(true);
      toast({
        title: "Camera Started",
        description: "Camera is now active",
      });
    } catch (error) {
      console.error("Camera error:", error);
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please allow camera permissions.",
        variant: "destructive",
      });
    }
  };

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    setIsCameraOn(false);
    setIsDetecting(false);
    setFaceCount(0);
  }, []);

  // Start face detection
  const startDetection = () => {
    if (!videoRef.current || !canvasRef.current || !isModelLoaded) return;

    setIsDetecting(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const detectFaces = async () => {
      if (!video || video.paused || video.ended) return;

      try {
        const detections = await faceapi.detectAllFaces(
          video,
          new faceapi.TinyFaceDetectorOptions({
            inputSize: 320,
            scoreThreshold: 0.5,
          })
        );

        setFaceCount(detections.length);

        // Draw detections on canvas
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw boxes around faces
          detections.forEach((detection) => {
            const { x, y, width, height } = detection.box;
            ctx.strokeStyle = "#22c55e";
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, width, height);

            // Draw label
            ctx.fillStyle = "#22c55e";
            ctx.font = "14px Arial";
            ctx.fillText(
              `Face (${Math.round(detection.score * 100)}%)`,
              x,
              y > 20 ? y - 5 : y + height + 15
            );
          });

          // Draw face count
          ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
          ctx.fillRect(10, 10, 150, 40);
          ctx.fillStyle = "#fff";
          ctx.font = "bold 18px Arial";
          ctx.fillText(`Faces: ${detections.length}`, 20, 38);
        }

        // Auto-send to API if enabled
        if (autoSend && selectedTemple && detections.length > 0) {
          const now = new Date();
          // Send every 5 seconds
          if (!lastSentTime || now.getTime() - lastSentTime.getTime() > 5000) {
            sendToBackend(detections.length);
          }
        }
      } catch (error) {
        console.error("Detection error:", error);
      }
    };

    // Run detection every 200ms
    detectionIntervalRef.current = window.setInterval(detectFaces, 200);
  };

  // Stop detection
  const stopDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    setIsDetecting(false);

    // Clear canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };

  // Send face count to backend
  const sendToBackend = async (count?: number) => {
    if (!selectedTemple) {
      toast({
        title: "Select Temple",
        description: "Please select a temple first",
        variant: "destructive",
      });
      return;
    }

    const faceCountToSend = count ?? faceCount;

    try {
      const response = await fetch("/api/crowd/face-detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templeId: selectedTemple,
          faceCount: faceCountToSend,
          cameraId: "laptop-cam",
          confidence: 0.85,
        }),
      });

      if (!response.ok) throw new Error("Failed to send data");

      const data = await response.json();
      setLastSentTime(new Date());
      setCrowdStatus(data.data.crowdStatus);

      toast({
        title: "Data Sent",
        description: `Sent ${faceCountToSend} faces - Status: ${data.data.crowdStatus}`,
      });
    } catch (error) {
      console.error("Send error:", error);
      toast({
        title: "Send Failed",
        description: "Could not send data to server",
        variant: "destructive",
      });
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "low":
        return "bg-green-500";
      case "moderate":
        return "bg-yellow-500";
      case "high":
        return "bg-orange-500";
      case "extreme":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Live Face Detection</h1>
            <p className="text-muted-foreground mt-2">
              Detect faces using your camera and update temple crowd status in real-time
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Camera View */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Camera Feed
                </CardTitle>
                <CardDescription>
                  {isLoading
                    ? "Loading face detection models..."
                    : isModelLoaded
                    ? "Face detection ready"
                    : "Models failed to load"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  )}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ display: isCameraOn ? "block" : "none" }}
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full"
                    style={{ display: isDetecting ? "block" : "none" }}
                  />
                  {!isCameraOn && !isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted">
                      <div className="text-center">
                        <CameraOff className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">Camera is off</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {!isCameraOn ? (
                    <Button
                      onClick={startCamera}
                      disabled={!isModelLoaded || isLoading}
                      className="flex-1"
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Start Camera
                    </Button>
                  ) : (
                    <Button onClick={stopCamera} variant="destructive" className="flex-1">
                      <CameraOff className="mr-2 h-4 w-4" />
                      Stop Camera
                    </Button>
                  )}

                  {isCameraOn && !isDetecting ? (
                    <Button onClick={startDetection} variant="secondary" className="flex-1">
                      <Activity className="mr-2 h-4 w-4" />
                      Start Detection
                    </Button>
                  ) : isCameraOn && isDetecting ? (
                    <Button onClick={stopDetection} variant="outline" className="flex-1">
                      Stop Detection
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            {/* Controls */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Face Count
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-5xl font-bold text-center text-primary">
                    {faceCount}
                  </div>
                  <p className="text-center text-muted-foreground mt-2">
                    faces detected
                  </p>
                  {crowdStatus && (
                    <div className="mt-4 text-center">
                      <Badge className={`${getStatusColor(crowdStatus)} text-white`}>
                        {crowdStatus.toUpperCase()}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Send to Temple</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select value={selectedTemple} onValueChange={setSelectedTemple}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select temple" />
                    </SelectTrigger>
                    <SelectContent>
                      {temples.map((temple) => (
                        <SelectItem key={temple.id} value={temple.id}>
                          {temple.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    onClick={() => sendToBackend()}
                    disabled={!selectedTemple || faceCount === 0}
                    className="w-full"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send Data
                  </Button>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Auto-send (5s)</span>
                    <Button
                      variant={autoSend ? "default" : "outline"}
                      size="sm"
                      onClick={() => setAutoSend(!autoSend)}
                    >
                      {autoSend ? "ON" : "OFF"}
                    </Button>
                  </div>

                  {lastSentTime && (
                    <p className="text-xs text-muted-foreground text-center">
                      Last sent: {lastSentTime.toLocaleTimeString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>How it works</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Click "Start Camera" to enable your webcam</li>
                <li>Click "Start Detection" to begin face detection</li>
                <li>Select a temple from the dropdown</li>
                <li>Click "Send Data" to update the temple's crowd status</li>
                <li>Enable "Auto-send" to automatically update every 5 seconds</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
