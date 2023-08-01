import PageContainer from "../../components/PageContainer";
import ErrorMessage from "../../components/ErrorMessage";
import InputField from "../../components/InputField";
import * as api from '../../util/api';
import { useRouter } from "next/router";
import { useRef, useState } from "react";

const CreateQueuePage = () => {
  const isMounted = useRef(true);
  const router = useRouter();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');

  return (
    <PageContainer title="Черги" subtitle="Створення нової черги">
      <InputField title="Назва черги" placeholder="Введіть назву..." value={name} onChange={t => setName(t)} />
      <button 
        className={`button is-info is-fullwidth ${loading ? 'is-loading' : ''}`}
        disabled={loading}
        onClick={async () => {
          setLoading(true);

          try {
            const { data } = await api.post(`${api.QUEUE_API}/admission/queues`, { name });
            router.push(`/queues/${data.queue.id}`);
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
        Створити чергу
      </button>
      {
        error &&
        <ErrorMessage style={{ marginTop: '15px' }} error={error} onClose={() => setError(null)} />
      }
    </PageContainer>
  );
};

export default CreateQueuePage;