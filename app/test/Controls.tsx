import { useMediaSessionWithTimeout } from '@/hooks/userMediaSessionTimeout';
import React, { useState, useRef, useEffect } from "react";
import styles from "./BottomControls.module.css";
import { useRouter } from "next/navigation";

interface Props {
  stream: MediaStream | null;
  email: string;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

const Controls: React.FC<Props> = ({ stream, email, videoRef }) => {
  const [remainingMs, setRemainingMs] = useState(30000); // 60 seconds
  const { recording, stopRecording } = useMediaSessionWithTimeout({
  stream,
  email,
  videoRef,
  remainingMs,
  redirectOnTimeout: '/thankyou',
  redirectOnManualStop: '/close'
});

useEffect(() => {
  const interval = setInterval(() => {
    setRemainingMs((prev) => {
      if (prev <= 1000) {
        clearInterval(interval);
        return 0;
      }
      return prev - 1000;
    });
  }, 1000);

  return () => clearInterval(interval);
}, []);

const formatTime = (ms: number) => {
  const seconds = Math.floor(ms / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};


  return (
    <div className={styles.controlsV2}>
      {/* Other buttons */}
      <div className={styles.timer}>⏳ Time Left: {formatTime(remainingMs)}</div>
      <button className={styles.timer} onClick={() => stopRecording()} disabled={!recording}>
        ❌ End Call
      </button>
    </div>
  );
};

export default Controls;