import useSWR from 'swr';
import Dropdown from "../../components/Dropdown";
import InputField from '../../components/InputField';
import * as api from '../../util/api';
import { useState, useRef } from 'react';
import ErrorMesage from '../../components/ErrorMessage';
import PageContainer from '../../components/PageContainer';
import Pagination from '../../components/Pagination';

const PAGE_SIZE = 12;

const EmptyPage = () => {
  return (
    <p className="subtitle" style={{ textAlign: 'center' }}>
      Користувачів не знайдено
    </p>
  );
};

const UserRow = ({ n, user: u }) => {
  const name = `${u.firstName}${u.lastName ? ` ${u.lastName}` : ''}`;
  return (
    <tr>
      <td width="100%">
        <b><a href={`/users/${u.id}`}>{name}</a></b>
        {
          (u.username && u.telegramId) &&
          <a href={`https://t.me/${u.username}`} style={{ marginLeft: '5px' }}>
            (@{u.username})
          </a>
        }
        {
          u.telegramId &&
          <a href={u.username ? `https://t.me/${u.username}` : null} target="_blank">
            <span className="tag is-info" style={{ float: 'right' }}>
              <span className="icon">
                <i className="fas fa-paper-plane"></i>
              </span>
            </span>
          </a>
        }
        <span className="tag is-success" style={{ float: 'right', marginRight: '5px' }} >
          <span className="icon">
            <i className="fas fa-id-card"></i>
          </span>
        </span>
      </td>
    </tr>
  );
};

const UsersPage = ({ data, page, onPageChange }) => {
  const { count, users } = data;

  if (count === 0) {
    return <EmptyPage />;
  }

  return (
    <div>
      <Pagination count={count} page={page} onChange={onPageChange} pageSize={PAGE_SIZE} />
      <table className="table is-hoverable is-fullwidth is-bordered">
        <tbody>
          {users.map((u, n) => <UserRow key={u.id} n={n} user={u} />)}
        </tbody>
      </table>
    </div>
  );
};

export default function UsersPageContainer() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);

  const skip = page * PAGE_SIZE;
  const { data, error, revalidate, isValidating } = useSWR(`${api.QUEUE_API}/admission/users?skip=${skip}&take=${PAGE_SIZE}${!query ? '' : `&search=${query}`}`, api.fetch, { shouldRetryOnError: true });

  return (
    <PageContainer title="Користувачі" subtitle="Список зареєстрованих користувачів">
      {
        (error && !isValidating)
          ? <ErrorMesage error={error} onClose={() => revalidate()} />
          : (
              <div>
                <InputField title="Пошук користувача" placeholder="Введіть ім'я..." value={query} onChange={(text) => { setQuery(text); setPage(0); }} />
                {
                  (!data)
                    ? <progress className="progress is-medium is-primary" max="100" />
                    : <UsersPage data={data} page={page} onPageChange={(page) => setPage(page)} />
                }
              </div>
            )
      }
    </PageContainer>
  )
}
