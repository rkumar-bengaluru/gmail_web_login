"use client";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { Test } from "@/types"; // Assuming types are in '@/types'

import VideoSection from "./VideoSection";
import AgentSection from "./AgentSection";
import BottomControls from "./BottomControls";

export default function DisplayInterview() {
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);

  const { data: session } = useSession();
  const [permissionModal, setPermissionModal] = useState(true);
  const [scopeModal, setScopeModal] = useState(false);
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [test, setTest] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    return () => {
      stopVideo();
      audioContextRef.current?.close();
    };
  }, []);

  useEffect(() => {
    const testJson = searchParams?.get("test");
    if (testJson) {
      try {
        setSelectedTest(JSON.parse(decodeURIComponent(testJson)) as Test);
      } catch (error) {
        console.error("Failed to parse test data:", error);
        router.push("/dashboard");
      }
    } else {
      router.push("/dashboard");
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (joined && videoRef.current) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((stream) => {
          videoRef.current!.srcObject = stream;
        })
        .catch((err) => {
          console.error("Error accessing camera:", err);
        });
    }
  }, [joined]);

  useEffect(() => {
    if (session?.user?.email) setEmail(session.user.email);
  }, [session]);

  useEffect(() => {
    const raw = localStorage.getItem("selectedTest");
    if (raw) setTest(JSON.parse(raw));
  }, []);

  const handlePermission = () => {
    setPermissionModal(false);
    setScopeModal(true);
  };

  const handleScope = async () => {
    setScopeModal(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setVideoEnabled(true);
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Permission denied or error:", err);
    }
  };

  const toggleAudio = async () => {
    setAudioEnabled((prev) => !prev);
    if (!audioEnabled) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      sourceRef.current =
        audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);

      const data = new Uint8Array(analyserRef.current.frequencyBinCount);
      const detectSpeech = () => {
        analyserRef.current?.getByteFrequencyData(data);
        const volume = data.reduce((a, b) => a + b, 0);
        setIsSpeaking(volume > 1000);
        requestAnimationFrame(detectSpeech);
      };
      detectSpeech();
    } else {
      audioContextRef.current?.close();
      setIsSpeaking(false);
    }
  };

  const stopVideo = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getVideoTracks().forEach((track) => {
        track.stop(); // ✅ stops the camera
      });
      videoRef.current.srcObject = null; // ✅ clears the video element
      setVideoEnabled(false);
      console.log("video stopped.");
    }
  };

  const toggleVideo = async () => {
    const videoElement = videoRef.current;

    if (!videoElement) return;

    const currentStream = videoElement.srcObject as MediaStream | null;

    if (videoEnabled) {
      // ✅ Turn OFF video
      if (currentStream) {
        currentStream.getVideoTracks().forEach((track) => track.stop());
        videoElement.srcObject = null;
      }
      setVideoEnabled(false);
      console.log("Video stopped");
    } else {
      // ✅ Turn ON video
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        videoElement.srcObject = newStream;
        setVideoEnabled(true);
        console.log("Video started");
      } catch (err) {
        console.error("Failed to start video:", err);
      }
    }
  };

  const handleJoined = async () => {
    if (!email.trim()) return;
    try {
      setJoined(true);
      const joinedStr: string = `User, ${email.trim()}! Joined the call.`;
      console.log(joinedStr);
    } catch (err) {
      console.error("Permission or recording error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      {/* Permission Modal */}
      {permissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md">
            <h2 className="text-lg font-semibold mb-4">
              Allow Microphone and Camera Access
            </h2>
            <button
              onClick={handlePermission}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Scope Modal */}
      {scopeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md">
            <h2 className="text-lg font-semibold mb-4">
              Allow access for this session or always?
            </h2>
            <button
              onClick={handleScope}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Allow for this session
            </button>
          </div>
        </div>
      )}

      {/* User Joined Call */}
      {joined && (
        <div style={{ width: "100vw", height: "90vh", overflow: "hidden" }}>
            <div
            style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                backgroundColor: "#202124",
            }}
            >
            {/* Main video + agent area */}
            <div
                style={{
                display: "flex",
                flex: 1,
                overflow: "hidden",
                }}
            >
                <div style={{ width: "50%" }}>
                <VideoSection ref={videoRef} />
                </div>
                <div style={{ width: "50%" }}>
                <AgentSection />
                </div>
            </div>

            {/* Bottom controls with fixed height */}
            <div style={{ height: "64px" }}>
                <BottomControls />
            </div>
            </div>
        </div>
        )}


      {/* Zoom-like UI */}
      {!permissionModal && !joined && !scopeModal && (
        <div className="flex w-full max-w-5xl bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Video Section */}
          <div className="w-2/3 bg-black relative">
            <video
              ref={videoRef}
              autoPlay
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 flex gap-4">
              <button
                onClick={toggleAudio}
                className="bg-white p-2 rounded-full shadow"
              >
                {audioEnabled ? (
                  <span
                    className={`text-green-600 ${isSpeaking ? "animate-pulse" : ""}`}
                  >
                    🎤
                  </span>
                ) : (
                  <span className="text-red-600">🔇</span>
                )}
              </button>
              <button
                onClick={toggleVideo}
                className="bg-white p-2 rounded-full shadow"
              >
                {videoEnabled ? (
                  <span className="text-green-600">📹</span>
                ) : (
                  <span className="text-red-600">📷</span>
                )}
              </button>
            </div>
          </div>

          {/* Email + Join Section */}
          <div className="w-1/3 p-6 flex flex-col justify-center">
            <label className="mb-2 text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 mb-4"
              placeholder="Enter your email"
            />
            <button
              disabled={!email}
              onClick={handleJoined}
              className={`py-2 px-4 rounded text-white ${email ? "bg-indigo-600 hover:bg-indigo-700" : "bg-gray-400 cursor-not-allowed"}`}
            >
              Join
            </button>

            <button
              onClick={stopVideo}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              ⏹️ Stop Video 1
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
