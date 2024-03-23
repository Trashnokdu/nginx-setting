import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import net from 'net';
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

// 포트 사용 가능 여부를 확인하는 함수
function checkPort(port: number): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const tester: net.Server = net
      .createServer()
      .once('error', (err: any) =>
        err.code == 'EADDRINUSE' ? resolve(false) : reject(err),
      )
      .once('listening', () =>
        tester.once('close', () => resolve(true)).close(),
      )
      .listen(port);
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
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
    for (const i of data) {
      const portAvailable = await checkPort(parseInt(i.proxy_port));
      if (!portAvailable) {
        return res.status(409).json({
          status: 409,
          code: 'PORT_CONFLICT',
          message: '이미 사용 중인 포트입니다.',
        });
      }
    }
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
