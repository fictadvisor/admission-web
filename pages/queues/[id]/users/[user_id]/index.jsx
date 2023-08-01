import { useRouter } from "next/router";
import useSWR from "swr";
import * as api from '../../../../../util/api';
import PageContainer from "../../../../../components/PageContainer";
import DocumentEditor from "../../../../../components/DocumentEditor";
import { useState, useRef } from "react";

const ProcessingPage = ({ queue: q, user: u, position: p, update }) => {
  const router = useRouter();
  const isMounted = useRef(true);
  const [loading, setLoading] = useState(false);

  return (
    <div>
      <hr />
        <div className="field is-grouped">
          <button 
            className={`button is-fullwidth is-warning ${loading ? 'is-loading' : ''}`}
            disabled={loading}
            onClick={async () => {
              const response = window.prompt('На скільки позицій ви хочете посунути цього користувача?', '10');
              const num = parseInt(response);
              if (num && Number.isSafeInteger(num) && num > 0) {
                setLoading(true);

                await api.patch(`${api.QUEUE_API}/admission/queues/${q.id}/users/${u.id}`, { status: 'waiting', position: p.position + num })
                  .catch(console.error);

                if (isMounted) {
                  router.push(`/queues/${q.id}`);
                }
              }
            }}
          >
            Відкласти
          </button>
          <button 
            className={`button is-danger is-fullwidth ${loading ? 'is-loading' : ''}`}
            disabled={loading}
            onClick={async () => {
              const yes = window.confirm('Ви впевнені, що хочете видалити цього користувача з черги?');
              if (yes) {
                setLoading(true);

                try {
                  await api.delete(`${api.QUEUE_API}/admission/queues/${q.id}/users/${u.id}`)

                  if (isMounted) {
                    router.push(`/queues/${q.id}`);
                  }
                }
                catch (e) { console.error(e); }

                setLoading(false);
              }
            }}
          >
            Закінчити роботу
          </button>
        </div>
      <hr />
      {
        p.status != 'processing' 
          ? (
            <button
              className={`button is-fullwidth is-link ${loading ? 'is-loading' : ''}`}
              disabled={loading}
              onClick={async () => {
                await api.patch(`${api.QUEUE_API}/admission/queues/${q.id}/users/${u.id}`, { status: 'processing' })
                    .catch(console.error);

                if (isMounted) {
                  update();
                  setLoading(false);
                }
              }}
            >
              Підтвердити, що абітурієнт прийшов
            </button>
          )
          : <DocumentEditor defaultData={u.details} />
      }
    </div>
  );
};

const ProcessingPageContainer = () => {
  const router = useRouter();
  const { data, error, revalidate, isValidating } = useSWR(`${api.QUEUE_API}/admission/queues/${router.query.id}/users/${router.query.user_id}`, api.fetch, { shouldRetryOnError: false, refreshInterval: 1000 });
  const queueName = data ? data.queue.name : 'Завантажується...';
  const name = data ? `${data.user.firstName}${data.user.lastName ? ` ${data.user.lastName}` : ''}` : 'Завантажується...';

  return (
    <PageContainer pageTitle={data ? `${name} - ${queueName}` : name} title={queueName} subtitle={data ? <a href={`/users/${data.user.id}`} onClick={() => router.push(`/users/${data.user.id}`)}>{name}</a> : name}>
      {
        (error && !isValidating)
          ? <ErrorMesage error={error} onClose={() => revalidate()} />
          : (
            !data
              ? <progress className="progress is-medium is-primary" max="100" />
              : <ProcessingPage queue={data.queue} user={data.user} position={data.position} update={() => revalidate()} />
          )
      }
    </PageContainer>
  );
};

export default ProcessingPageContainer;
