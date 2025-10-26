"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface UseMediaSessionOptions {
  stream: MediaStream | null;
  email: string;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  redirectOnTimeout?: string;
  redirectOnManualStop?: string;
  remainingMs?: number; // e.g. 60000 for 60 seconds
}

export const useMediaSessionWithTimeout = ({
  stream,
  email,
  videoRef,
  remainingMs: initialRemainingMs, // Renamed to clarify it's the initial value
  redirectOnTimeout = "/thankyou",
  redirectOnManualStop = "/close",
}: UseMediaSessionOptions) => {
  const router = useRouter();
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const redirectTargetRef = useRef<string>(redirectOnTimeout);
  const [recording, setRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | undefined>(initialRemainingMs); // Internal countdown state
  const hasStoppedRef = useRef(false);
  const hasUploadedRef = useRef(false);
  const isManualStopRef = useRef<boolean>(false); // Track if stop was manual

  useEffect(() => {
    if (!recording || initialRemainingMs === undefined || hasStoppedRef.current)
      return;

    if (initialRemainingMs <= 0) {
      hasStoppedRef.current = true;
      redirectTargetRef.current = redirectOnTimeout;
      recorderRef.current?.stop();
    }
  }, [recording, initialRemainingMs, timeLeft]);


  // MediaRecorder setup
  useEffect(() => {
    if (stream && !recording && !hasStoppedRef.current) {
      try {
        const recorder = new MediaRecorder(stream);
        recorderRef.current = recorder;
        chunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        recorder.onstop = () => {
          if (hasUploadedRef.current) return;
          if (!isManualStopRef.current) {
            hasUploadedRef.current = true;

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
                hasUploadedRef.current = false; // Allow retry on failure
                }
            })();
          } else {
            // Manual stop: skip upload, just stop stream and redirect
            stopStream();
            console.log("manully stopped.")
            router.push(
              `${redirectOnManualStop}?email=${encodeURIComponent(email)}`,
            );
          }
        };

        recorder.start();
        setRecording(true);
        console.log("Recording started");
      } catch (err) {
        console.error("Failed to start recording:", err);
      }
    }

  }, [stream]);

  const stopStream = () => {
    if (videoRef?.current) {
      const refStream = videoRef.current.srcObject as MediaStream | null;
      refStream?.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

    stream?.getTracks().forEach((track) => track.stop());
    console.log("Media stream fully stopped.");
  };

  const stopRecording = (redirectTarget: string = redirectOnManualStop, isManual: boolean = true) => {
    if (recorderRef.current && recording && !hasStoppedRef.current) {
      hasStoppedRef.current = true;
      isManualStopRef.current = isManual; // Set manual stop flag
      redirectTargetRef.current = redirectTarget;
      recorderRef.current.stop();
      setRecording(false);
      if (timeoutRef.current) clearInterval(timeoutRef.current);
      console.log(`Recording stopped ${isManual ? "manually" : "by timeout"}`);
    }
  };

//   const stopRecording = (redirectTarget: string = redirectOnManualStop) => {
//     if (recorderRef.current && recording && !hasStoppedRef.current) {
//       hasStoppedRef.current = true;
//       redirectTargetRef.current = redirectTarget;
//       recorderRef.current.stop();
//       setRecording(false);
//       if (timeoutRef.current) clearInterval(timeoutRef.current);
//       console.log("Recording stopped");
//     }
//   };

  return {
    recording,
    stopRecording,
    timeLeft, // Return internal timeLeft instead of prop
  };
};