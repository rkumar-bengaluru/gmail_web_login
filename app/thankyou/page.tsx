'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
const ThankYou: React.FC = () => {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");

  useEffect(() => {
      const email = searchParams?.get("email");
      if (email) setEmail(email)
    }, [searchParams]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.heading}>✅ Test Completed</h1>
        <p style={styles.message}>
          Thank you{email ? `, ${email}` : ''}, your interview session has been successfully recorded and submitted.
        </p>
        <p style={styles.subtext}>
          You may now return to your dashboard to continue.
        </p>
        <Link href="/dashboard" style={styles.link}>
          🔙 Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    height: '100vh',
    backgroundColor: '#202124',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#fff',
    fontFamily: 'Segoe UI, sans-serif',
  },
  card: {
    backgroundColor: '#2c2c2e',
    padding: '32px',
    borderRadius: '12px',
    boxShadow: '0 0 12px rgba(0,0,0,0.4)',
    textAlign: 'center',
    maxWidth: '480px',
  },
  heading: {
    fontSize: '28px',
    marginBottom: '16px',
  },
  message: {
    fontSize: '18px',
    marginBottom: '12px',
  },
  subtext: {
    fontSize: '14px',
    color: '#ccc',
    marginBottom: '20px',
  },
  link: {
    display: 'inline-block',
    padding: '10px 20px',
    backgroundColor: '#0070f3',
    color: '#fff',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: 500,
    transition: 'background-color 0.2s ease',
  },
};

export default ThankYou;
