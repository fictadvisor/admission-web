import useSWR from 'swr';
import Dropdown from "../../components/Dropdown";
import InputField from '../../components/InputField';
import * as api from '../../util/api';
import { useState, useRef } from 'react';
import ErrorMesage from '../../components/ErrorMessage';
import PageContainer from '../../components/PageContainer';
import Pagination from '../../components/Pagination';
import { useRouter } from 'next/router';

const types = [
  {
    name: 'Всі користувачі',
    selector: 'all'
  },
  {
    name: 'Користувачі усіх черг',
    selector: 'queues'
  },
  {
    name: 'Користувачі однієї черги',
    selector: 'queue'
  },
];

const MailingPage = () => {
  const { data: qdata } = useSWR(`${api.QUEUE_API}/admission/queues`, api.fetch, { shouldRetryOnError: true });
  const isMounted = useRef(true);
  const [type, setType] = useState(null);
  const [queue, setQueue] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');

  return (
    <PageContainer title="Розсилка" subtitle="Розсилка повідомлень через бота">
      <Dropdown defaultText="Виберіть тип розсилки..."  data={types.map(t => ({ key: t.selector, name: t.name }))} active={type} onChange={v => setType(v.key)} style={{ marginBottom: '15px' }} />
      {
        type == 'queue' &&
          <Dropdown 
            defaultText='Оберіть чергу...' 
            data={qdata ? qdata.queues.map(q => ({ key: q.id, name: q.name })) : []} 
            active={queue}
            onChange={e => setQueue(e.key)}
            style={{ marginLeft: '5px' }}
          />
      }
      <textarea class="textarea" value={text} onChange={e => setText(e.target.value)} placeholder="Введіть повідомлення..." style={{ marginBottom: '15px' }} />
      <button 
        className={`button is-link is-fullwidth ${loading ? 'is-loading' : ''}`}
        disabled={!type || loading || !text}
        onClick={async () => {
          const yes = window.confirm(`Ви впевнені, що хочете почати розсилку? (${types.find(t => t.selector === type).name})`);
          if (!yes) { return; }

          setLoading(true);

          try {
            const { data } = await api.post(`${api.QUEUE_API}/admissionmailing`, {
              selector: type,
              message: text,
              queue_id: queue,
            });

            window.alert(`Розсилка почалась (${data.count} користувачів)`);
          } catch (e) {
            if (isMounted) {
              setError(e);
            }
          }

          if (isMounted) {
            setLoading(false);
          }
        }}
      >
        Відправити
      </button>
    </PageContainer>
  );
};

export default MailingPage;