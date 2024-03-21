import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
const dir = '/root/.proxy/stream/';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const proxyList: string[] = [];
  const data = fs.readdirSync(dir, 'utf-8');
  data.forEach((i) => {
    if (fs.statSync(dir + i).isDirectory()) proxyList.push(i);
  });
  return res.send(proxyList);
}
