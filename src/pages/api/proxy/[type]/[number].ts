import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
const dir = '/root/.proxy/stream/';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const number = req.query.number as string;
  const type = req.query.type as string;
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
  if (!type) {
    return res.status(400).send({
      code: 'INVALID_REQUIRED_PARAM',
      message: '필수 파라미터가 누락되었습니다.',
    });
  }
  data.forEach((i) => {
    if (fs.statSync(dir + i).isDirectory()) proxyList.push(i);
  });
  if (proxyList.includes(type)) {
    const now_files = fs.readdirSync(dir + type);
    if (!now_files.includes(number + '.cfg')) {
      return res.status(404).send({
        code: 'NOT_FOUND',
        message: '존재하지않는 설정입니다.',
      });
    }
    const fileContent = fs.readFileSync(
      dir + type + '/' + `${number}.cfg`,
      'utf-8',
    );

    // 정규 표현식을 사용하여 listen과 backend 주소 추출
    const listenRegex = /listen (\d+\.\d+\.\d+\.\d+:\d+)/g;
    const backendRegex = /proxy_pass (\d+\.\d+\.\d+\.\d+:\d+)/g;

    let listenMatch;
    let backendMatch;

    while (
      (listenMatch = listenRegex.exec(fileContent)) !== null &&
      (backendMatch = backendRegex.exec(fileContent)) !== null
    ) {
      alldata.push({
        listen: listenMatch[1],
        backend: backendMatch[1],
        port: listenMatch[1].split(':')[1],
      });
    }

    return res.send(alldata);
  }
  return res.status(404).send({
    code: 'NOT_FOUND',
    message: '존재하지않는 VPS 종류입니다.',
  });
}
