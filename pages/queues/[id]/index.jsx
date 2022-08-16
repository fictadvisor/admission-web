import useSWR from 'swr';
import { useRouter } from 'next/router';
import * as api from '../../../util/api';
import { useState, useRef } from 'react';
import ErrorMesage from '../../../components/ErrorMessage';
import PageContainer from '../../../components/PageContainer';
import statuses from '../../../util/status';
import Pagination from '../../../components/Pagination';
import PositionActions from '../../../components/PositionActions';

const PositionRow = ({ n, queue: q, position: p, update }) => {
  const { user: u } = p;
  const router = useRouter();
  const status = statuses[p.status];

  return (
    <tr>
      <th width="0%">{p.status === 'processing' ? '-' : p.relativePosition}</th>
      <th width="0%">{p.code}</th>
      <th width="50%"><a href={`/users/${u.id}`} onClick={() => router.push(`/users/${u.id}`)}>{`${u.firstName}${u.lastName ? ` ${u.lastName}` : ''}`}</a></th>
      <td width="0%">
        <span className={`tag ${status.color}`}>{status.name}</span>
      </td>
      <td width="50%">
        <PositionActions user={p.user} status={p.status} queue={q} position={p.position} update={update} />
      </td>
    </tr>
  );
};

const PAGE_SIZE = 10;

const QueuePage = ({ queue: q, size, update: _update }) => {
  const isMounted = useRef(true);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const skip = page * PAGE_SIZE;
  const { data, error: listError, revalidate } = useSWR(`${api.QUEUE_API}/queues/${q.id}/users?skip=${skip}&take=${PAGE_SIZE}`, api.fetch, { shouldRetryOnError: true, refreshInterval: 5000 });
  const queueSize = data ? data.count : size;
  const update = () => { revalidate(); _update(); };

  return (
    <div>
      <div className="tags">
        {
          q.open 
            ? <span className="tag is-success is-light" style={{ float: 'right', marginRight: '5px' }}>Відкрита</span>
            : <span className="tag is-danger is-light" style={{ float: 'right', marginRight: '5px' }}>Зачинена</span>
        }
        {
          q.active 
            ? <span className="tag is-success">Активна</span>
            : <span className="tag is-danger">Неактивна</span>
        }
        {
          (queueSize) > 0 
          ?
            <div className="tags has-addons like-tag">
              <span className="tag is-info">Очікують</span>
              <span className="tag"><b>{queueSize}</b></span>
            </div>
          : <span className="tag is-warning">Черга порожня</span>
        }
      </div>

      <hr />

      <div className="field is-grouped">
        <button
          className={`button is-info is-fullwidth ${loading ? 'is-loading' : ''}`}
          disabled={loading || size === 0 || !api.hasAccess(api.getRole(), 'operator')}
          onClick={async () => {
            setLoading(true);

            try {
              const { data } = await api.post(`${api.QUEUE_API}/queues/${q.id}/advance`);

              if (isMounted) {
                router.push(`/queues/${q.id}/users/${data.user.id}`);
              }
            } catch (e) {
              if (isMounted) {
                setLoading(false);
                setError(e);
              }
            }
          }}
        >
          <span>Розглянути наступного</span>
        </button>
        {
          api.hasAccess(api.getRole(), 'admin') && 
          <>
            <button
              className={`button ${q.active ? 'is-danger' : 'is-success'} is-outlined ${loading ? 'is-loading' : ''}`}
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                
                try {
                  await api.put(`${api.QUEUE_API}/queues/${q.id}`, { active: !q.active });

                  if (isMounted) {
                    update();
                    setLoading(false);
                  }
                } catch (e) {
                  if (isMounted) {
                    setLoading(false);
                    setError(e);
                  }
                }
              }}
            >
              <span>{q.active ? 'Зупинити чергу' : 'Відновити чергу'}</span>
            </button>

            <button
              className={`button ${q.open ? 'is-danger' : 'is-success'} is-light is-outlined ${loading ? 'is-loading' : ''}`}
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                
                try {
                  await api.put(`${api.QUEUE_API}/queues/${q.id}`, { open: !q.open });

                  if (isMounted) {
                    update();
                    setLoading(false);
                  }
                } catch (e) {
                  if (isMounted) {
                    setLoading(false);
                    setError(e);
                  }
                }
              }}
            >
              <span>{q.open ? 'Закрити чергу' : 'Відкрити чергу'}</span>
            </button>
          </>
        }
      </div>

      {
        error &&
        <ErrorMesage error={error} style={{ marginTop: '15px' }} onClose={() => setError(null)} />
      }

      <hr />

      {
        (!data)
          ? <progress className="progress is-medium is-primary" max="100" />
          : data.count > 0 &&
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <Pagination count={data.count} page={page} onChange={(p) => setPage(p)} pageSize={PAGE_SIZE} />
            <div style={{ marginTop: '16px' }}>
              <table className="table is-bordered is-fullwidth is-hoverable" style={{ verticalAlign: 'middle', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Код</th>
                    <th>Користувач</th>
                    <th>Статус</th>
                    <th>Дія</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    data.positions.map(p => <PositionRow key={p.id} queue={q} position={p} update={update} />)
                  }
                </tbody>
              </table>
            </div>
          </div>
      }
    </div>
  );
};

export default function QueuePageContainer() {
  const router = useRouter();
  const { data, error, revalidate, isValidating } = useSWR(`${api.QUEUE_API}/queues/${router.query.id}`, api.fetch, { shouldRetryOnError: false });
  const name = data ? data.queue.name : 'Завантажується...';

  return (
    <PageContainer title={name}>
      {
        (error && !isValidating)
          ? <ErrorMesage error={error} onClose={() => revalidate()} />
          : (
            !data
              ? <progress className="progress is-medium is-primary" max="100" />
              : <QueuePage size={data.queueSize} queue={data.queue} update={() => revalidate()} />
          )
      }
    </PageContainer>
  );
}
