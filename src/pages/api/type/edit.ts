import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const dir = '/root/.proxy/stream/';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { types } = req.body;

  if (!types || !Array.isArray(types) || types.length === 0) {
    return res.status(400).send({
      code: 'INVALID_REQUIRED_PARAM',
      message: '필수 파라미터가 누락되었습니다.',
    });
  }

  try {
    for (const name of types) {
      const targetDir = path.join(dir, name);

      // 디렉토리 존재 여부 확인
      if (fs.existsSync(targetDir)) {
      } else {
        // 디렉토리 생성
        fs.mkdirSync(targetDir, { recursive: true });
      }
    }

    // 리스트에 없는 디렉토리 삭제
    const existingDirs = fs.readdirSync(dir);
    for (const existingDir of existingDirs) {
      if (!types.includes(existingDir)) {
        const targetDir = path.join(dir, existingDir);
        fs.rmdir(targetDir, { recursive: true }, (err) => {
          if (err) {
            console.error(`디렉토리 "${targetDir}" 삭제 중 오류 발생:`, err);
          }
        });
      }
    }

    return res.status(200).json({
      status: 200,
      code: 'OPERATION_SUCCESS',
      message: '작업이 성공적으로 완료되었습니다.',
    });
  } catch (err) {
    console.error('작업 중 오류 발생:', err);
    return res.status(500).send({
      code: 'OPERATION_ERROR',
      message: '작업 중 오류가 발생했습니다.',
    });
  }
}
