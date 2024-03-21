import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import React from 'react';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';

type Proxy = {
  proxy_ip: string;
  proxy_port: string;
  backend_ip: string;
  backend_port: string;
  [key: string]: string; // 인덱스 시그니처를 추가하여 동적 속성 이름을 허용
};

export default function Home() {
  const [types, setTypes] = useState<string[]>([]);
  const [selectedValue, setSelectedValue] = useState('');
  const [phone, setPhone] = useState<string>('');
  const params = useSearchParams();
  const [proxies, setProxies] = useState<Proxy[]>([
    { proxy_ip: '', proxy_port: '', backend_ip: '', backend_port: '' },
  ]);

  useEffect(() => {
    fetch('/api/type')
      .then((res) => res.json())
      .then((data) => {
        setTypes(data);
        if (data.length > 0) setSelectedValue(data[0]);
      });
  }, []);

  useEffect(() => {
    if (!params.get('phone')) {
      return;
    }
    const phone = params.get('phone');
    const type = params.get('type');
    setPhone(phone!.toString());
    setSelectedValue(type!.toString());
    if (phone !== null && type !== null) {
      fetch(`/api/proxy/${type}/${phone}`)
        .then((res) => {
          if (!res.ok) {
            location.href = '/';
          }
          return res.json();
        })
        .then((data) => {
          const newArray = data.map((item: any) => {
            // listen과 backend에서 IP와 포트를 분리합니다.
            const [listenIP, listenPort] = item.listen.split(':');
            const [backendIP, backendPort] = item.backend.split(':');

            // 새로운 형식의 객체를 반환합니다.
            return {
              proxy_ip: listenIP,
              proxy_port: listenPort,
              backend_ip: backendIP,
              backend_port: backendPort,
            };
          });
          setProxies(newArray);
        });
    }
  }, [params]);
  useEffect(() => {
    console.log(proxies);
  }, [proxies]);
  if (types.length === 0) {
    return <>Now Loading</>;
  }
  // 프록시 정보 입력란 추가 함수
  const addOne = () => {
    setProxies([
      ...proxies,
      { proxy_ip: '', proxy_port: '', backend_ip: '', backend_port: '' },
    ]);
  };
  // 프록시 정보 입력 처리 함수 (예시로 단순화됨)
  const onChange = (index: number, field: keyof Proxy, value: string) => {
    const updatedProxies = [...proxies];
    updatedProxies[index][field] = value;
    setProxies(updatedProxies);
  };

  return (
    <main className="flex flex-col items-center justify-center p-10 mx-auto">
      <h1 className="text-3xl font-semibold mb-6 mx-auto">신규 프록시 등록</h1>
      <div className="grid w-full max-w-sm justify-center gap-1.5 mb-8">
        <Label>VPS 타입</Label>
        <select
          style={{ width: '229px' }}
          className="outline outline-2 outline-offset-2 rounded"
          value={selectedValue}
          disabled
        >
          {types.map((i) => (
            <option value={i} key={i}>
              {i}
            </option>
          ))}
        </select>
      </div>
      <div className="grid w-full max-w-sm justify-center gap-1.5 mb-8">
        <Label>전화번호</Label>
        <input
          disabled
          type="text"
          id="Phone"
          className="outline outline-2 outline-offset-2 rounded"
          value={phone}
        />
      </div>
      {proxies.map((proxy, index) => (
        <React.Fragment key={index}>
          <div className="list_con">
            <div className="grid w-full max-w-sm justify-center gap-1.5 mb-8">
              <Label>프록시 IP</Label>
              <input
                onChange={(e) => onChange(index, 'proxy_ip', e.target.value)}
                type="text"
                id={`proxy_ip_${index}`}
                className="outline outline-2 outline-offset-2 rounded"
                value={proxy.proxy_ip}
              />
            </div>
            <div className="grid w-full max-w-sm justify-center gap-1.5 mb-8">
              <Label>프록시 포트</Label>
              <input
                onChange={(e) => onChange(index, 'proxy_port', e.target.value)}
                type="text"
                id={`proxy_port_${index}`}
                className="outline outline-2 outline-offset-2 rounded"
                value={proxy.proxy_port}
              />
            </div>
            <div className="grid w-full max-w-sm justify-center gap-1.5 mb-8">
              <Label>벡엔드 아이피</Label>
              <input
                onChange={(e) => onChange(index, 'backend_ip', e.target.value)}
                type="text"
                id={`backend_ip_${index}`}
                className="outline outline-2 outline-offset-2 rounded"
                value={proxy.backend_ip}
              />
            </div>
            <div className="grid w-full max-w-sm justify-center gap-1.5 mb-8">
              <Label>백엔드 포트</Label>
              <input
                onChange={(e) =>
                  onChange(index, 'backend_port', e.target.value)
                }
                type="text"
                id={`backend_port_${index}`}
                className="outline outline-2 outline-offset-2 rounded"
                value={proxy.backend_port}
              />
            </div>
            <div className="grid w-full max-w-sm justify-center content-center">
              <Button
                className="bg-red-500 text-white py-2 px-6 rounded-lg"
                onClick={() => {
                  const updatedProxies = proxies.filter((_, i) => i !== index);
                  setProxies(updatedProxies);
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
            .post('/api/edit', {
              phone: phone,
              type: selectedValue,
              data: proxies,
            })
            .then(() => {
              alert('수정이 완료되었습니다');
            })
            .catch((error) => {
              if (error.response.status === 409) {
                return alert('사용중인 포트입니다');
              }
              alert('일시적인 오류가 발생하였습니다');
            });
        }}
      >
        등록
      </Button>
    </main>
  );
}
