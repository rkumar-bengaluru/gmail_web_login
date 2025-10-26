"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface UseMediaSessionOptions {
  stream: MediaStream | null;
  email: string;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  redirectOnTimeout?: string; // e.g. '/thankyou'
  redirectOnManualStop?: string; // e.g. '/close'
  remainingMs?: number; // e.g. 60000 for 60 seconds
}

export const useMediaSession = ({
  stream,
  email,
  videoRef,
  remainingMs,
  redirectOnTimeout = "/thankyou",
  redirectOnManualStop = "/close",
}: UseMediaSessionOptions) => {
  const router = useRouter();
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const redirectTargetRef = useRef<string>(redirectOnTimeout);
  const [recording, setRecording] = useState(false);
  const hasStoppedRef = useRef(false);

  useEffect(() => {
    if (!recording || remainingMs === undefined || hasStoppedRef.current)
      return;

    if (remainingMs <= 0) {
      hasStoppedRef.current = true;
      redirectTargetRef.current = redirectOnTimeout;
      recorderRef.current?.stop();
    }
  }, [remainingMs, recording]);

  useEffect(() => {
    if (stream && !recording) {
      try {
        const recorder = new MediaRecorder(stream);
        recorderRef.current = recorder;
        chunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        recorder.onstop = () => {
          
          const blob = new Blob(chunksRef.current, { type: "video/webm" });
          const formData = new FormData();
          formData.append("recording", blob, "interview.webm");
          formData.append("email", email);

          (async () => {
            try {
              const res = await fetch("/api/uploadRecording", {
                method: "POST",
                body: formData,
              });

              if (!res.ok) throw new Error("Upload failed");
              console.log("Recording uploaded successfully");

              stopStream();
              router.push(
                `${redirectTargetRef.current}?email=${encodeURIComponent(email)}`,
              );
            } catch (err) {
              console.error("Upload error:", err);
              setRecording(false);
            }
          })();
        };

        recorder.start();
        setRecording(true);
        console.log("Recording started");
      } catch (err) {
        console.error("Failed to start recording:", err);
      }
    }
  }, [stream, recording]);

  const stopStream = () => {
    if (videoRef?.current) {
      const refStream = videoRef.current.srcObject as MediaStream | null;
      refStream?.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

    stream?.getTracks().forEach((track) => track.stop());
    console.log("Media stream fully stopped.");
  };

  const stopRecording = () => {
    if (recorderRef.current && recording && !hasStoppedRef.current) {
      hasStoppedRef.current = true;
      redirectTargetRef.current = redirectOnManualStop;
      recorderRef.current.stop();
      setRecording(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      console.log("Recording manually stopped");
    }
  };

  return {
    recording,
    stopRecording,
    remainingMs,
  };
};
