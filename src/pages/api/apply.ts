import * as child_process from 'child_process';
import { NextApiRequest, NextApiResponse } from 'next';

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

  try {
    await new Promise<void>((resolve, reject) => {
      child_process.exec('sudo nginx -s reload', (error) => {
        if (error) {
          console.error(error);
          reject(new Error('Nginx에서 오류가 발생하였습니다'));
        } else {
          resolve();
        }
      });
    });
    return res.status(200).json({
      status: 200,
      code: 'PROXY_APPLY_SUCCESS',
      message: '프록시 적용에 성공했습니다.',
    });
  } catch (error) {
    return res.status(418).json({
      status: 418,
      code: 'NGINX_ERROR',
      message: 'Nginx에서 오류가 발생하였습니다',
    });
  }
}
