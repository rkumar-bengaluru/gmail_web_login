import React, { useState, useRef, useEffect } from "react";
import styles from "./BottomControls.module.css";
import { useRouter } from "next/navigation";

interface Props {
  stream: MediaStream | null;
  email: string;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

const BottomControls: React.FC<Props> = ({ stream, email, videoRef }) => {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [recording, setRecording] = useState(false);
  const chunksRef = useRef<Blob[]>([]);
  const router = useRouter(); // Next.js


  const stopVideo = () => {
  // Stop tracks from videoRef
  if (videoRef.current) {
    const refStream = videoRef.current.srcObject as MediaStream | null;
    refStream?.getTracks().forEach(track => track.stop());
    videoRef.current.srcObject = null;
  }

  // Stop tracks from original stream prop
  stream?.getTracks().forEach(track => track.stop());

  console.log("Video stream fully stopped.");
};


  // Start recording when component mounts
  useEffect(() => {
    if (stream && !recording) {
      try {
        const recorder = new MediaRecorder(stream);
        recorderRef.current = recorder;
        chunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunksRef.current.push(e.data);
          }
        };

        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: "video/webm" });
          const url = URL.createObjectURL(blob);
          console.log("Recording stopped. Video URL:", url);

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

              // ✅ Stop video after upload
              stopVideo();

              // ✅ Redirect after upload
              await new Promise(resolve => setTimeout(resolve, 100)); // small delay
              router.push(`/thankyou?email=${encodeURIComponent(email)}`);
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

  const handleStopRecording = () => {
    if (recorderRef.current && recording) {
      recorderRef.current.stop();
      setRecording(false);
      console.log("stopped...");
    }
  };

  return (
    <div className={styles.controlsV2}>
      <button
        onClick={() => setMicOn(!micOn)}
        className={micOn ? styles.active : ""}
      >
        🎙️ {micOn ? "Mute" : "Unmute"}
      </button>
      <button
        onClick={() => setCamOn(!camOn)}
        className={camOn ? styles.active : ""}
      >
        📷 {camOn ? "Stop Cam" : "Start Cam"}
      </button>
      <button
        onClick={() => setScreenSharing(!screenSharing)}
        className={screenSharing ? styles.active : ""}
      >
        🖥️ {screenSharing ? "Stop Share" : "Share Screen"}
      </button>
      <button className={styles.endCall}>❌ End Call</button>
      <button onClick={handleStopRecording}>❌ End Call</button>
    </div>
  );
};

export default BottomControls;
