import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import * as child_process from 'child_process';
const dir = '/root/.proxy/stream/';

type Proxy = {
  proxy_ip: string;
  proxy_port: string;
  backend_ip: string;
  backend_port: string;
};

function createNginxConfig(data: any) {
  let config = '';

  data.forEach((item: Proxy) => {
    config += `server {\n`;
    config += `    listen ${item.proxy_ip}:${item.proxy_port};\n`;
    config += `    proxy_pass ${item.backend_ip}:${item.backend_port};\n`;
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

  try {
    dirdata.forEach((i) => {
      if (fs.statSync(dir + i).isDirectory()) proxyList.push(i);
    });
    const portSet = new Set();
    for (const item of data) {
      if (portSet.has(item.proxy_port)) {
        // 이미 존재하는 'proxy_port'를 발견한 경우, 오류 메시지 반환
        return res.status(409).json({
          status: 409,
          code: 'REQ_PORT_CONFLICT',
          message: '요청된 데이터 내에 중복된 프록시 포트가 존재합니다.',
        });
      }
      portSet.add(item.proxy_port); // 'portSet'에 'proxy_port' 추가
    }
    proxyList.forEach((i: any) => {
      const now_files = fs.readdirSync(dir + i);
      now_files.forEach((fileName) => {
        if (i === type && fileName === phone + '.cfg') {
          return; // 현재 반복을 스킵
        }
        const fileContent = fs.readFileSync(dir + i + '/' + fileName, 'utf-8');
        const listenRegex = /listen (\d+\.\d+\.\d+\.\d+:(\d+))/g;
        const listenMatches = [...fileContent.matchAll(listenRegex)];
        const ports = listenMatches.map((match) => match[1].split(':')[1]);
        for (const configItem of data) {
          // 'data' 배열의 각 항목에 대해 순회
          for (const port of ports) {
            // 파일에서 추출한 각 포트에 대해 순회
            if (configItem.proxy_port === port) {
              // 'data' 배열의 항목 중 'proxy_port'와 현재 포트가 일치하는지 확인
              return res.status(409).json({
                status: 409,
                code: 'PORT_CONFLICT',
                message: '이미 사용 중인 포트입니다.',
              });
            }
          }
        }
      });
    });
    fs.writeFileSync(dir + type + '/' + phone + '.cfg', ''); // 동기적 방식으로 변경
    child_process.exec('sudo nginx -s reload', (error) => {
      if (error) {
        console.error(error);
        return res.status(418).json({
          status: 418,
          code: 'NGINX_ERROR',
          message: 'Nginx에서 오류가 발생하였습니다',
        });
      }
    });
    const config = createNginxConfig(data);
    console.log(dir + type + '/' + phone + '.cfg');
    fs.writeFileSync(dir + type + '/' + phone + '.cfg', config); // 동기적 방식으로 변경
    child_process.exec('sudo nginx -s reload', (error) => {
      if (error) {
        console.error(error);
        return res.status(418).json({
          status: 418,
          code: 'NGINX_ERROR',
          message: 'Nginx에서 오류가 발생하였습니다',
        });
      }
      return res.status(200).json({
        status: 200,
        code: 'PROXY_CREATE_SUCCESS',
        message: '프록시 작성에 성공했습니다.',
      });
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
