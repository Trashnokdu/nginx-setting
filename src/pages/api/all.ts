import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
const dir = '/root/.proxy/stream/';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const proxyList: string[] = [];
  const alldata: object[] = [];
  const data = fs.readdirSync(dir, 'utf-8');
  if (req.method !== 'GET') {
    return res.status(405).json({
      status: 405,
      code: 'METHOD_NOT_ALLOWED',
      message: '지원하지 않는 메서드입니다.',
    });
  }
  data.forEach((i) => {
    if (fs.statSync(dir + i).isDirectory()) proxyList.push(i);
  });
  proxyList.forEach((i) => {
    const now_files = fs.readdirSync(dir + i);
    now_files.forEach((fileName) => {
      const fileContent = fs.readFileSync(dir + i + '/' + fileName, 'utf-8');
      const listenRegex = /listen (\d+\.\d+\.\d+\.\d+:(\d+))/g;
      const backendRegex = /proxy_pass (\d+\.\d+\.\d+\.\d+:(\d+))/g;

      // matchAll 메소드를 사용하여 모든 listen 매치를 찾아내고 배열로 변환
      const listenMatches = [...fileContent.matchAll(listenRegex)];
      const backendMatch = backendRegex.exec(fileContent);

      // listenMatches 배열을 사용하여 포트 번호를 추출하고 이를 ','로 구분하여 문자열로 합침
      const ports = listenMatches
        .map((match) => match[1].split(':')[1])
        .join(',');

      if (listenMatches.length > 0 && backendMatch) {
        alldata.push({
          type: i,
          number: fileName.replace('.cfg', ''),
          listen: listenMatches.map((match) => match[1]).join(', '), // 여러 listen 주소를 문자열로 합침
          backend: backendMatch[1],
          port: ports, // 수정된 포트 번호 부분
        });
      }
    });
  });
  return res.send(alldata);
}
