import axios from 'axios';

export const TEMPLATE_API = process.env.NEXT_PUBLIC_TEMPLATE_API;
export const QUEUE_API = process.env.NEXT_PUBLIC_QUEUE_API;

const weight = {
  reception: 0,
  operator: 10,
  admin: 100,
};

export const hasAccess = (role, type) => weight[role ? role.type : 'reception'] >= weight[type];

export const askOperator = () => {
  if (!process.browser) { return; }

  const value = parseInt(window.prompt('Введіть ваш номер оператора', getOperator() ?? ''));

  if (Number.isSafeInteger(value) && value > 0) {
    setOperator(value);
    return value;
  }

  return askOperator();  
};

export const askText = (title) => { return window.prompt(title); };

let role;

export const getRole = () => role;

export const askLogin = async (force = false) => {
  let token = getToken();
  console.log(token);

  if (token == null || force) {
    const username = askText('Введіть вашу пошту');
    const password = askText('Введіть ваш пароль');

    const { data } = await this.post(`${QUEUE_API}/auth/login`, {
      username,
      password,
    });

    console.log(data);

    setToken(data.refreshToken);
  }

  try {
    const { data } = await axios.get(`${QUEUE_API}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    role = data.id;

    setToken(token);

    return data;
  } catch (e) {
    alert('Перезавантаж сторінку, а то щось сталося дивне :(')
    console.log(e)
  }
};

export const getToken = () => process.browser ? (localStorage.getItem('local.token') ?? null) : null;

export const setToken = (str) => str == null ? localStorage.removeItem('local.token') : localStorage.setItem('local.token', str);

export const getOperator = () => process.browser ? (localStorage.getItem('local.operator') ?? null) : null;

export const setOperator = (str) => localStorage.setItem('local.operator', str);

const getAuthHeader = (op) => op ? `Bearer ${getToken()} ${getOperator() ?? 0}` : `Bearer ${getToken()}`;

export const fetch = async (path) => {
  const { data } = await axios.get(path, {
    headers: {
      Authorization: getAuthHeader(false),
    },
  });

  return data;
};

export const post = (url, data, options = {}, op = true) => {
  return axios.post(url, data, {
    headers: {
      Authorization: getAuthHeader(op),
    },
    ...options,
  });
};

export const put = (url, data, options = {}, op = true) => {
  return axios.put(url, data, {
    headers: {
      Authorization: getAuthHeader(op),
    },
    ...options,
  });
};

const deleteRequest = (url, options = {}, op = true) => {
  return axios.delete(url, {
    headers: {
      Authorization: getAuthHeader(op),
    },
    ...options,
  });
};

export { deleteRequest as delete };
