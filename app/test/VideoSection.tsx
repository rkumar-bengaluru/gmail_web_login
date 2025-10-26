// VideoSection.tsx
import React, { ForwardedRef } from "react";
import styles from "./VideoSection.module.css";

// Define props (empty for now, but good practice)
interface VideoSectionProps {
  // Add props here if needed later (e.g., name, stream, etc.)
}

// Use React.forwardRef to accept a ref from parent
const VideoSection = React.forwardRef<HTMLVideoElement, VideoSectionProps>(
  (props, ref) => {
    return (
      <div className={styles.videoContainer}>
        {/* Forward the ref to the <video> element */}
        <video
          ref={ref}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        <div className={styles.nameTag}>You</div>
      </div>
    );
  }
);

// Optional: helps with debugging in React DevTools
VideoSection.displayName = "VideoSection";

export default VideoSection;