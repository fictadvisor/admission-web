import PageContainer from "../../components/PageContainer";
import ErrorMessage from "../../components/ErrorMessage";
import InputField from "../../components/InputField";
import Dropdown from "../../components/Dropdown";
import * as api from '../../util/api';
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import useSWR from "swr";
import { v4 as uuid } from 'uuid';

const CreateUserPage = () => {
  const isMounted = useRef(true);
  const { data: qdata } = useSWR(`${api.QUEUE_API}/admission/queues`, api.fetch, { shouldRetryOnError: true })
  const [dropdownQueue, setDropdownQueue] = useState(null);
  const router = useRouter();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  return (
    <PageContainer title="Черги" subtitle="Створення користувача для черги">
      <Dropdown 
        defaultText="Оберіть чергу..."
        data={qdata ? qdata.queues.map(q => ({ key: q.id, name: q.name })) : []} 
        active={dropdownQueue}
        onChange={e => setDropdownQueue(e.key)}
        style={{ marginBottom: '15px' }}
      />
      <InputField title="Прізвище" placeholder="Введіть прізвище..." value={lastName} onChange={t => setLastName(t)} />
      <InputField title="Ім'я" placeholder="Введіть ім'я..." value={firstName} onChange={t => setFirstName(t)} />
      <button 
        className={`button is-info is-fullwidth ${loading ? 'is-loading' : ''}`}
        disabled={loading || !dropdownQueue}
        onClick={async () => {
          setLoading(true);

          try {
            const queueId = dropdownQueue;
            const { data: { user } } = await api.post(`${api.QUEUE_API}/admission/users`, { id: uuid(), first_name: firstName, last_name: lastName, telegram: false });
            await api.post(`${api.QUEUE_API}/admission/queues/${queueId}/users`, { id: user.id, force: true });

            router.push(`/users/${user.id}`);
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
        Додати до черги
      </button>
      {
        error &&
        <ErrorMessage style={{ marginTop: '15px' }} error={error} onClose={() => setError(null)} />
      }
    </PageContainer>
  );
};

export default CreateUserPage;