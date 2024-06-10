import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import React from 'react';
import axios from 'axios';

export default function Home() {
  const [types, setTypes] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/type')
      .then((res) => res.json())
      .then((data) => {
        setTypes(data);
      });
  }, []);

  if (types.length === 0) {
    return <>Now Loading</>;
  }

  const addOne = () => {
    setTypes([...types, '']);
  };

  const onChange = (index: number, value: string) => {
    const updatedProxies = [...types];
    updatedProxies[index] = value;
    setTypes(updatedProxies);
  };

  return (
    <main className="flex flex-col items-center justify-center p-10 mx-auto">
      <h1
        className="text-3xl font-semibold mb-6 mx-auto"
        style={{ marginBottom: '100px' }}
      >
        서버 타입 수정
      </h1>
      {types.map((type, index) => (
        <React.Fragment key={index}>
          <div className="list_con">
            <div className="grid w-1/2 max-w-sm justify-center gap-1.5 mb-8">
              <Label>경로명</Label>
              <input
                style={{ width: '80%' }}
                onChange={(e) => onChange(index, e.target.value)}
                type="text"
                id={`proxy_ip_${index}`}
                className="outline outline-2 outline-offset-2 rounded"
                value={type}
              />
            </div>
            <div className="grid w-1/2 max-w-sm justify-center content-center">
              <Button
                className="bg-red-500 text-white py-2 px-6 rounded-lg"
                onClick={() => {
                  const updatedProxies = types.filter((_, i) => i !== index);
                  setTypes(updatedProxies);
                }}
              >
                삭제
              </Button>
            </div>
          </div>
        </React.Fragment>
      ))}
      <button
        className="list_con"
        style={{ border: 'none', display: 'flex', justifyContent: 'center' }}
        onClick={addOne} // 수정됨: addone -> addOne
      >
        <span
          className=""
          style={{
            alignSelf: 'center',
            border: 'none',
            background: 'none',
            color: '#999999',
            marginRight: '0.625rem',
            fontSize: '1.25rem',
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="20"
            viewBox="0 -960 960 960"
            width="20"
          >
            <path
              fill="#999999"
              d="M440-440v120q0 17 11.5 28.5T480-280q17 0 28.5-11.5T520-320v-120h120q17 0 28.5-11.5T680-480q0-17-11.5-28.5T640-520H520v-120q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640v120H320q-17 0-28.5 11.5T280-480q0 17 11.5 28.5T320-440h120Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"
            />
          </svg>
        </span>
      </button>
      <Button
        className="bg-blue-500 text-white py-2 px-6 rounded-lg"
        onClick={() => {
          axios
            .post('/api/type/edit', {
              types: types,
            })
            .then(() => {
              alert('수정이 완료되었습니다');
            })
            .catch(() => {
              alert('일시적인 오류가 발생하였습니다');
            });
        }}
      >
        등록
      </Button>
    </main>
  );
}
