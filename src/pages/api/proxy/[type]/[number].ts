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
    const serverBlockRegex = /server\s*\{(.*?)\}/gs;
    const listenRegex = /listen (\d+\.\d+\.\d+\.\d+):(\d+)(?:(?: udp))?/g;
    const protocolRegex = /proxy_protocol/;
    const backendRegex = /proxy_pass\s+(\d+\.\d+\.\d+\.\d+:\d+)/;
    const bindRegex = /proxy_bind\s+(\S+);/;

    let serverBlockMatch;
    while ((serverBlockMatch = serverBlockRegex.exec(fileContent)) !== null) {
      const serverBlockContent = serverBlockMatch[1];
      console.log(serverBlockContent);
      const listenMatches = serverBlockContent.match(listenRegex);
      const backendMatch = backendRegex.exec(serverBlockContent);
      const bindMatch = bindRegex.exec(serverBlockContent);
      const protocolMatch = protocolRegex.exec(serverBlockContent);
      if (listenMatches && backendMatch) {
        const ipPortList = [];
        for (const item of listenMatches) {
          const ipPort = item.split(' ')[1];
          ipPortList.push(ipPort);
        }
        for (const listenMatch of listenMatches) {
          alldata.push({
            listen: ipPortList,
            backend: backendMatch[1],
            port: listenMatch.split(':')[1],
            proxy_bind: bindMatch ? bindMatch[1] : '',
            udp: listenMatch.includes('udp') ? true : false,
            protocol: protocolMatch ? true : false,
          });
        }
      }
    }

    return res.send(alldata);
  }
  return res.status(404).send({
    code: 'NOT_FOUND',
    message: '존재하지않는 VPS 종류입니다.',
  });
}
