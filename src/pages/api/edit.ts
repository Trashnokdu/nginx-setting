import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
const dir = '/root/.proxy/stream/';

type Proxy = {
  proxy_ip: string;
  proxy_port: string;
  proxy_bind: string;
  backend_ip: string;
  backend_port: string;
  udp: string;
  protocol: string;
};

function createNginxConfig(data: any) {
  let config = '';

  data.forEach((item: Proxy) => {
    config += `server {\n`;
    config += `    listen ${item.proxy_ip}:${item.proxy_port}${item.udp === 'true' ? ' udp' : ''};\n`;
    item.proxy_bind ? (config += `    proxy_bind ${item.proxy_bind};\n`) : '';
    config += `    proxy_pass ${item.backend_ip}:${item.backend_port};\n`;
    item.protocol
      ? (config += `    ${item.protocol === 'true' ? 'proxy_protocol on;' : ''}\n`)
      : '';
    config += `}\n\n`;
  });

  return config;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const proxyList: string[] = [];
  const dirdata = fs.readdirSync(dir, 'utf-8');
  if (req.method !== 'POST') {
    return res.status(405).json({
      status: 405,
      code: 'METHOD_NOT_ALLOWED',
      message: '지원하지 않는 메서드입니다.',
    });
  }

  const { data, phone, type } = req.body;

  if (!type || !phone || !data) {
    return res.status(400).send({
      code: 'INVALID_REQUIRED_PARAM',
      message: '필수 파라미터가 누락되었습니다.',
    });
  }
  if (data.length === 0) {
    try {
      if (fs.readFileSync(dir + type + '/' + phone + '.cfg')) {
        fs.rmSync(dir + type + '/' + phone + '.cfg');
        return res.status(200).json({
          status: 200,
          code: 'PROXY_CREATE_SUCCESS',
          message: '프록시 작성에 성공했습니다.',
        });
      } else {
        return res.status(200).json({
          status: 200,
          code: 'PROXY_CREATE_SUCCESS',
          message: '프록시 작성에 성공했습니다.',
        });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        status: 500,
        code: 'COMMON_ERROR',
        message: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요',
      });
    }
  }
  try {
    dirdata.forEach((i) => {
      if (fs.statSync(dir + i).isDirectory()) proxyList.push(i);
    });
    const ipPortSet = new Set();
    for (const item of data) {
      const ipPort = item.proxy_ip + ':' + item.proxy_port; // IP와 포트를 결합하여 고유한 문자열 생성
      if (ipPortSet.has(ipPort)) {
        // 이미 존재하는 'proxy_ip:proxy_port' 조합을 발견한 경우, 오류 메시지 반환
        return res.status(409).json({
          status: 409,
          code: 'REQ_PORT_CONFLICT',
          message: '요청된 데이터 내에 중복된 프록시 포트가 존재합니다.',
        });
      }
      ipPortSet.add(ipPort); // 'ipPortSet'에 'proxy_ip:proxy_port' 조합 추가
    }

    proxyList.forEach((i: any) => {
      const now_files = fs.readdirSync(dir + i);
      now_files.forEach((fileName) => {
        if (i === type && fileName === phone + '.cfg') {
          return; // 현재 반복을 스킵
        }
        const fileContent = fs.readFileSync(dir + i + '/' + fileName, 'utf-8');
        const listenRegex = /listen (\d+\.\d+\.\d+\.\d+):(\d+)/g; // IP와 포트를 분리해서 캡처
        const listenMatches = [...fileContent.matchAll(listenRegex)];
        const ipPortPairs = listenMatches.map((match) => ({
          ip: match[1],
          port: match[2],
        })); // IP와 포트를 객체로 매핑
        for (const configItem of data) {
          // 'data' 배열의 각 항목에 대해 순회
          for (const ipPort of ipPortPairs) {
            // 파일에서 추출한 각 IP-포트 쌍에 대해 순회
            if (
              configItem.proxy_ip === ipPort.ip &&
              configItem.proxy_port === ipPort.port
            ) {
              // 'data' 배열의 항목 중 'proxy_ip'와 'proxy_port'가 현재 IP-포트 쌍과 모두 일치하는지 확인
              return res.status(409).json({
                status: 409,
                code: 'PORT_CONFLICT',
                message: '이미 사용 중인 IP와 포트입니다.',
              });
            }
          }
        }
      });
    });

    const config = createNginxConfig(data);
    console.log(dir + type + '/' + phone + '.cfg');
    fs.writeFileSync(dir + type + '/' + phone + '.cfg', config); // 동기적 방식으로 변경
    return res.status(200).json({
      status: 200,
      code: 'PROXY_CREATE_SUCCESS',
      message: '프록시 작성에 성공했습니다.',
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 500,
      code: 'COMMON_ERROR',
      message: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요',
    });
  }
}
