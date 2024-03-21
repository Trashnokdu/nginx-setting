import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface Song {
  type: string;
  number: string;
  listen: string;
  backend: string;
  port: string;
}

export default function Home() {
  const [data, setData] = useState<Song[]>([]);
  const [types, setTypes] = useState([]);
  const router = useRouter();
  const [selectedValue, setSelectedValue] = useState('');
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    // 선택된 값을 상태로 저장합니다.
    setSelectedValue(event.target.value);
  };
  useEffect(() => {
    fetch('/api/all')
      .then((res) => res.json())
      .then((data) => setData(data));
    fetch('/api/type')
      .then((res) => res.json())
      .then((data) => {
        setTypes(data);
        setSelectedValue(data[0]);
      });
  }, []);
  if (types.length === 0) {
    return <>now Loading</>;
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
      <table className="table">
        <thead>
          <tr>
            <th>Phone Number</th>
            <th>VPS Type</th>
            <th>Proxy Ports</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          {data
            .filter((item) => item.type === selectedValue) // selectedValue와 일치하는 type을 가진 항목만 필터링
            .map((item, index) => (
              <tr key={index}>
                <td>{item.number}</td>
                <td>{item.type}</td>
                <td>{item.port}</td>
                <td>
                  <a
                    href={`/edit?phone=${item.number}&type=${item.type}`}
                    style={{ color: 'blue' }}
                  >
                    수정하러가기
                  </a>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </main>
  );
}
