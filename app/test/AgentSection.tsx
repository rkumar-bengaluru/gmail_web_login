import React from 'react';
import styles from './AgentSection.module.css';

const AgentSection: React.FC = () => {
  return (
    <div className={styles.agentContainer}>
      <img 
        src="/assets/ai.jpg" 
        alt="Agent Avatar" 
        className={styles.avatar} 
      />
      <div className={styles.nameTag}>Agent</div>
    </div>
  );
};

export default AgentSection;
