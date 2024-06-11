import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';

interface Response {
  type: string;
  number: string;
  listen: string;
  backend: string;
  bind: string;
  port: string;
}

const deleteItem = (phone: string, type: string) => {
  axios
    .post('/api/edit', {
      phone: phone,
      type: type,
      data: [],
    })
    .then(() => {
      alert('수정이 완료되었습니다');
    })
    .catch((error) => {
      if (error.response.status === 418) {
        return alert('Nginx에서 오류가 발생하였습니다');
      }
      if (error.response.status === 409) {
        if (error.response.data.code == 'REQ_PORT_CONFLICT') {
          return alert('입력값에 중복된 포트가 있습니다');
        }
        return alert('사용중인 포트입니다');
      }
      alert('일시적인 오류가 발생하였습니다');
    });
};

export default function Home() {
  const [data, setData] = useState<Response[]>([]);
  const [types, setTypes] = useState([]);
  const router = useRouter();
  const [selectedValue, setSelectedValue] = useState('');
  const params = useSearchParams();

  useEffect(() => {
    const fetchData = async () => {
      const [allData, typeData] = await Promise.all([
        fetch('/api/all').then((res) => res.json()),
        fetch('/api/type').then((res) => res.json()),
      ]);
      setData(allData);
      setTypes(typeData);
      const type = params.get('type');
      setSelectedValue(type || typeData[0]);
    };
    fetchData();
  }, [params]);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = event.target.value;
    setSelectedValue(newType);
    router.push(`?type=${newType}`);
  };

  if (types.length === 0) {
    return <>Loading...</>;
  }

  return (
    <main className="p-10">
      <Button
        className="bg-blue-500 text-white py-2 px-6 rounded-lg"
        style={{ marginBottom: '10px', marginLeft: '10px' }}
        onClick={() => {
          router.push('/newproxy');
        }}
      >
        프록시 추가하기
      </Button>
      <select
        style={{ marginLeft: '10px' }}
        className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-primary/90 h-10 bg-blue-700 text-white py-2 px-6 rounded-lg"
        value={selectedValue}
        onChange={handleChange}
      >
        {types.map((i) => (
          <option value={i} key={i}>
            {i}
          </option>
        ))}
      </select>
      <Button
        className="bg-blue-500 text-white py-2 px-6 rounded-lg"
        style={{ marginBottom: '10px', marginLeft: '10px' }}
        onClick={() => {
          axios
            .post('/api/apply')
            .then(() => {
              alert('수정이 완료되었습니다');
            })
            .catch((error) => {
              if (error.response.status === 418) {
                return alert('Nginx에서 오류가 발생하였습니다');
              }
              if (error.response.status === 409) {
                if (error.response.data.code == 'REQ_PORT_CONFLICT') {
                  return alert('입력값에 중복된 포트가 있습니다');
                }
                return alert('사용중인 포트입니다');
              }
              alert('일시적인 오류가 발생하였습니다');
            });
        }}
      >
        프록시 적용하기
      </Button>
      <Button
        className="bg-blue-500 text-white py-2 px-6 rounded-lg"
        style={{ marginBottom: '10px', marginLeft: '10px' }}
        onClick={() => {
          location.href = '/vpsedit';
        }}
      >
        서버 타입 수정하기
      </Button>
      <table className="table">
        <thead>
          <tr>
            <th>Phone Number</th>
            <th>VPS Type</th>
            <th>listen</th>
            <th>Proxy pass</th>
            <th>proxy bind</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {data
            .filter((item) => item.type === selectedValue) // selectedValue와 일치하는 type을 가진 항목만 필터링
            .map((item, index) => (
              <tr key={index}>
                <td>{item.number}</td>
                <td>{item.type}</td>
                <td>{item.listen}</td>
                <td>{item.backend}</td>
                <td>{item.bind}</td>
                <td>
                  <a
                    href={`/edit?phone=${item.number}&type=${item.type}`}
                    style={{ color: 'blue' }}
                  >
                    수정하러가기
                  </a>
                </td>
                <td>
                  <a
                    href="#"
                    style={{ color: 'red' }}
                    onClick={(e) => {
                      e.preventDefault();
                      if (window.confirm('정말 삭제하시겠습니까?')) {
                        deleteItem(item.number, item.type);
                      }
                    }}
                  >
                    삭제
                  </a>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </main>
  );
}
