import useSWR from 'swr';
import { useRouter } from 'next/router';
import Dropdown from "../../components/Dropdown";
import * as api from '../../util/api';
import { useState, useRef } from 'react';
import ErrorMesage from '../../components/ErrorMessage';
import PageContainer from '../../components/PageContainer';
import statuses from '../../util/status';
import PositionActions from '../../components/PositionActions';

const QueueRow = ({ queue: q, user: u, update }) => {
  const router = useRouter();
  const status = !q.active ? statuses.notActive : statuses[q.position.status];

  return (
    <tr>
      <th><a href={`/queues/${q.id}`} onClick={() => router.push(`/queues/${q.id}`)}>{q.name}</a></th>
      <td>{q.position.status === 'PROCESSING' ? '-' : q.position.relativePosition}</td>
      <td>{q.position.code}</td>
      <td>
        <span className={`tag ${status.color}`}>{status.name}</span>
      </td>
      <td>
        <PositionActions user={u} queue={q} status={q.position.status} position={q.position.position} update={update} />
      </td>
    </tr>
  );
};

const UserPage = ({ user: u, queues, update }) => {
  const isMounted = useRef(true);
  const { data: qdata } = useSWR(`${api.QUEUE_API}/admission/queues`, api.fetch, { shouldRetryOnError: true });
  const [dropdownQueue, setDropdownQueue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  return (
    <div>
      <div className="tags">
        {
          u.telegramId &&
          <a className="tag is-info" href={u.username ? `https://t.me/${u.username}` : null} target="_blank">Telegram</a>
        }
        <span className="tag is-success">Пройшов попередню реєстрацію</span>
      </div>

      <hr />

      <Dropdown 
        defaultText='Оберіть чергу...' 
        data={qdata ? qdata.queues.filter(v => !queues.find(q => q.id == v.id)).map(q => ({ key: q.id, name: q.name })) : []} 
        active={dropdownQueue}
        onChange={e => setDropdownQueue(e.key)}
        style={{ marginRight: '5px' }}
      />
      <button
        className={`button is-success is-outlined ${loading ? 'is-loading' : ''}`}
        disabled={!dropdownQueue || loading}
        onClick={async () => {
          try {
            await api.post(`${api.QUEUE_API}/admission/queues/${dropdownQueue}/users`, { id: u.id, force: true });

            if (isMounted) {
              update();
              setLoading(false);
              setDropdownQueue(null);
            }
          } catch (e) {
            if (isMounted) {
              setLoading(false);
              setError(e);
            }
          }
        }}
      >
        <span className="icon is-info">
          <i className="fas fa-plus"></i>
        </span>
        <span>Додати до черги</span>
      </button>

      {
        error &&
        <ErrorMesage error={error} style={{ marginTop: '15px' }} onClose={() => setError(null)} />
      }

      <hr />

      {
        queues.length > 0 &&
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <b>Черги</b>
          <div style={{ marginTop: '16px' }}>
            <table className="table is-bordered is-fullwidth is-hoverable" style={{ verticalAlign: 'middle', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th width="50%">Назва</th>
                <th width="0%">Позиція</th>
                <th width="0%">Номер</th>
                <th width="0%">Статус</th>
                <th width="50%">Дія</th>
              </tr>
            </thead>
              <tbody>
                {
                  queues.map(q => <QueueRow key={q.id} queue={q} user={u} update={update} />)
                }
              </tbody>
            </table>
          </div>
        </div>
      }
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <b>Додаткова інформація</b>
        <table className="table is-bordered is-striped is-fullwidth" style={{ marginTop: '16px' }}>
          <tbody>
            <tr key="lastName"><th>Прізвище</th><td>{ u.lastName }</td></tr>
            <tr key="firstName"><th>Ім'я</th><td>{ u.firstName }</td></tr>
            <tr key="middleName"><th>По батькові</th><td>{ u.middleName }</td></tr>
            <tr key="speciality"><th>Спеціальність</th><td>{ u.specialty }</td></tr>
            <tr key="phone"><th>Номер телефону</th><td>{ u.phone }</td></tr>
            <tr key="email"><th>Пошта</th><td>{ u.email }</td></tr>
            <tr key="isDorm"><th>Чи планує селитися?</th><td>{ u.isDorm ? `Так` : `Ні` }</td></tr>
            <tr key="printedEdbo"><th>Чи роздрукована заява ЄДЕБО?</th><td>{ u.printedEdbo ? `Так` : `Ні` }</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function UserPageContainer() {
  const router = useRouter();
  const { data, error, revalidate, isValidating } = useSWR(`${api.QUEUE_API}/admission/users/${router.query.id}`, api.fetch, { shouldRetryOnError: false });
  const name = data ? `${data.user.firstName} ${data.user.lastName}` : 'Завантажується...';

  return (
    <PageContainer pageTitle={name} title={data ? <>{name}<span style={{ float: 'right', marginLeft: '5px', fontSize: '12px' }}>id: {data.user.id}</span></> : name}>
      {
        (error && !isValidating)
          ? <ErrorMesage error={error} onClose={() => revalidate()} />
          : (
            !data
              ? <progress className="progress is-medium is-primary" max="100" />
              : <UserPage user={data.user} queues={data.queues} update={() => revalidate()} />
          )
      }
    </PageContainer>
  )
}
