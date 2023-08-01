import { useRef, useState } from "react";
import * as api from '../util/api';
import { useRouter } from "next/router";

const PositionActions = ({ user: u, queue: q, status, position, update }) => {
  const router = useRouter();
  const isMounted = useRef(true);
  const [loading, setLoading] = useState(false);
  const isOp = api.hasAccess(api.getRole(), 'operator');

  return (
    <div className="buttons is-fullwidth is-centered">
      <button 
        className={`button is-success is-small ${loading ? 'is-loading' : ''}`}
        disabled={loading || !isOp}
        onClick={async () => {
          if (status != 'processing' && status != 'going') {
            await api.put(`${api.QUEUE_API}/admission/queues/${q.id}/users/${u.id}`, { status: 'going' })
              .then(() => isMounted && router.push(`/queues/${q.id}/users/${u.id}`))
              .catch(console.error);
          } else {
            router.push(`/queues/${q.id}/users/${u.id}`);
          }
        }}
      >
        Розглянути
      </button>
      <button 
        className={`button is-warning is-small ${loading ? 'is-loading' : ''}`}
        disabled={loading || !isOp}
        onClick={async () => {
          const response = window.prompt('На скільки позицій ви хочете посунути цього користувача?', '10');
          const num = parseInt(response);
          if (num && Number.isSafeInteger(num) && num > 0) {
            setLoading(true);

            await api.put(`${api.QUEUE_API}/admission/queues/${q.id}/users/${u.id}`, { status: 'waiting', position: position + num })
              .catch(console.error);

            if (isMounted) {
              setLoading(false);
              update();
            }
          }
        }}
      >
        Посунути
      </button>
      <button 
        className={`button is-danger is-small ${loading ? 'is-loading' : ''}`}
        disabled={loading || !isOp}
        onClick={async () => {
          const yes = window.confirm('Ви впевнені, що хочете видалити цього користувача з черги?');
          if (yes) {
            setLoading(true);

            await api.delete(`${api.QUEUE_API}/admission/queues/${q.id}/users/${u.id}`)
                .catch(console.error);

            if (isMounted) {
              setLoading(false);
              update();
            }
          }
        }}
      >
        Видалити
      </button>
    </div>
  );
};

export default PositionActions;