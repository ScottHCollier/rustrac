import axios, { AxiosError, type AxiosResponse } from 'axios';
import { PaginatedResponse } from '../models/paginatedResponse';
import { token } from '../store/auth';

const sleep = () => new Promise((resolve) => setTimeout(resolve, 500));

axios.defaults.baseURL = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = true;

const responseBody = (response: AxiosResponse) => response.data;

axios.interceptors.request.use((config) => {
  let tokenValue;

  const unsubscribe = token.subscribe((value) => {
    tokenValue = value;
  });

  if (tokenValue) config.headers.Authorization = `Bearer ${tokenValue}`;

  return config;
});

axios.interceptors.response.use(
  async (response) => {
    if (import.meta.env.DEV) await sleep();
    const pagination = response.headers['pagination'];
    if (pagination) {
      response.data = new PaginatedResponse(
        response.data,
        JSON.parse(pagination)
      );
    }
    return response;
  },
  async (error: AxiosError) => {
    const { data, status } = error.response as AxiosResponse;

    switch (status) {
      case 400:
        if (data.errors) {
          const modelStateErrors: string[] = [];

          for (const key in data.errors) {
            if (data.errors[key]) {
              modelStateErrors.push(data.errors[key]);
            }
          }

          throw modelStateErrors.flat();
        }

        // TODO: Toast
        break;
      case 401:
        // TODO: Toast
        break;
      case 500:
        // TODO: Router navigate server-error
        break;
      default:
        break;
    }

    return Promise.reject(error.response);
  }
);

const requests = {
  get: (url: string, params?: URLSearchParams) =>
    axios.get(url, { params }).then(responseBody),
  post: (url: string, body: object) => axios.post(url, body).then(responseBody),
  put: (url: string, body: object) => axios.put(url, body).then(responseBody),
  delete: (url: string) => axios.delete(url).then(responseBody),
};

// const TestErrors = {
//   get400Error: () => requests.get('buggy/bad-request'),
//   get401Error: () => requests.get('buggy/unauthorized'),
//   get404Error: () => requests.get('buggy/not-found'),
//   getValidationError: () => requests.get('buggy/validation-error'),
//   get500Error: () => requests.get('buggy/server-error'),
// };

const Routes = {
  getPublic: () => requests.get(`public`),
  login: (values: any) => requests.post('login', values),
  getPrivate: () => requests.get(`private`),
  getTest: () => requests.get('test')
};

const agent = { Routes };

export default agent;
