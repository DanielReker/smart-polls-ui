import axios, {type AxiosRequestConfig} from 'axios';

export const AXIOS_INSTANCE = axios.create({
    baseURL: '/api',
});

AXIOS_INSTANCE.interceptors.request.use((config) => {
    const token = localStorage.getItem('poll_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

AXIOS_INSTANCE.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn('Session expired or invalid');
        }
        return Promise.reject(error);
    }
);

export const customInstance = async <T>(
    config: AxiosRequestConfig,
    options?: AxiosRequestConfig,
): Promise<T> => {
    const {data} = await AXIOS_INSTANCE({
        ...config,
        ...options,
    });
    return data;
};