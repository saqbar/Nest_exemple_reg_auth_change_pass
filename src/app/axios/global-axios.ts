import axios, { AxiosInstance } from 'axios';
import * as process from 'process';

const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: `${process.env.API_FILE_SERVICE_URL}`,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.API_FILE_SERVICE_KEY}`,
    },
  });

  instance.interceptors.request.use((config) => {
    return config;
  });

  return instance;
};

export default createAxiosInstance;
