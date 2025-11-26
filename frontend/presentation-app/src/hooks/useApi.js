import { useState, useCallback, useMemo } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

const useApi = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    return instance;
  }, []);

  const request = useCallback(async (method, url, body = null) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api[method](url, body);
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err.response ? err.response.data : err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api]);

  return { data, error, loading, request };
};

export default useApi;
