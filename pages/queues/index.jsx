import useSWR from 'swr';
import Dropdown from "../../components/Dropdown";
import InputField from '../../components/InputField';
import * as api from '../../util/api';
import { useState, useRef } from 'react';
import ErrorMesage from '../../components/ErrorMessage';
import PageContainer from '../../components/PageContainer';
import Pagination from '../../components/Pagination';
import { useRouter } from 'next/router';

const EmptyPage = () => {
  return (
    <p className="subtitle" style={{ textAlign: 'center' }}>
      Черги відсутні
    </p>
  );
};

const QueueRow = ({ queue: q }) => {
  const router = useRouter();
  return (
    <tr>
      <td width="0%">{q.id}</td>
      <td width="100%">
        <b><a onClick={() => router.push(`/queues/${q.id}`)}>{q.name}</a></b>
        
        {
          q.active 
            ? <span className="tag is-success" style={{ float: 'right' }}>Активна</span>
            : <span className="tag is-danger" style={{ float: 'right' }}>Неактивна</span>
        }
        {
          q.open 
            ? <span className="tag is-success is-light" style={{ float: 'right', marginRight: '5px' }}>Відкрита</span>
            : <span className="tag is-danger is-light" style={{ float: 'right', marginRight: '5px' }}>Зачинена</span>
        }
      </td>
    </tr>
  );
};

const QueuesPage = ({ data }) => {
  const { queues } = data;

  if (queues.length === 0) {
    return <EmptyPage />;
  }

  return (
    <div>
      <table className="table is-hoverable is-fullwidth is-bordered">
        <tbody>
          {queues.map(q => <QueueRow key={q.id} queue={q} />)}
        </tbody>
      </table>
    </div>
  );
};

export default function QueuesPageContainer() {
  const { data, error, revalidate, isValidating } = useSWR(`${api.QUEUE_API}/admission/queues`, api.fetch, { shouldRetryOnError: true });

  return (
    <PageContainer title="Черги" subtitle="Список існуючих черг">
      {
        (error && !isValidating)
          ? <ErrorMesage error={error} onClose={() => revalidate()} />
          : (
              (!data)
                ? <progress className="progress is-medium is-primary" max="100" />
                : <QueuesPage data={data} />
            )
      }
    </PageContainer>
  )
}
