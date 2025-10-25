// pages/api/uploadRecording.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const chunks: Buffer[] = [];
  req.on('data', (chunk) => chunks.push(chunk));
  req.on('end', () => {
    const buffer = Buffer.concat(chunks);
    const filePath = path.join(process.cwd(), 'public', 'uploads', `interview-${Date.now()}.webm`);
    fs.writeFileSync(filePath, buffer);
    res.status(200).json({ message: 'Saved' });
  });
}
