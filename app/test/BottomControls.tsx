import React, { useState } from 'react';
import styles from './BottomControls.module.css';

const BottomControls: React.FC = () => {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);

  return (
    <div className={styles.controlsV2}>
      <button onClick={() => setMicOn(!micOn)} className={micOn ? styles.active : ''}>
        🎙️ {micOn ? 'Mute' : 'Unmute'}
      </button>
      <button onClick={() => setCamOn(!camOn)} className={camOn ? styles.active : ''}>
        📷 {camOn ? 'Stop Cam' : 'Start Cam'}
      </button>
      <button onClick={() => setScreenSharing(!screenSharing)} className={screenSharing ? styles.active : ''}>
        🖥️ {screenSharing ? 'Stop Share' : 'Share Screen'}
      </button>
      <button className={styles.endCall}>❌ End Call</button>
    </div>
  );
};

export default BottomControls;
