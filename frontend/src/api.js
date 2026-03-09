import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh' && originalRequest.url !== '/auth/login') {
            originalRequest._retry = true;
            try {
                const res = await axios.post('http://localhost:3000/api/auth/refresh', {}, { withCredentials: true });
                localStorage.setItem('token', res.data.accessToken);
                return apiClient(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem('token');
                window.location.reload();
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export const authApi = {
    register: async (email, password) => {
        const response = await apiClient.post('/auth/register', { email, password });
        return response.data;
    },
    login: async (email, password) => {
        const response = await apiClient.post('/auth/login', { email, password });
        if (response.data.accessToken) {
            localStorage.setItem('token', response.data.accessToken);
        }
        return response.data;
    },
    logout: async () => {
        await apiClient.post('/auth/logout');
        localStorage.removeItem('token');
    },
    getMe: async () => {
        const response = await apiClient.get('/auth/me');
        return response.data;
    }
};

export const api = {
    getProducts: async () => {
        const response = await apiClient.get('/products');
        return response.data;
    },
    createProduct: async (product) => {
        const response = await apiClient.post('/products', product);
        return response.data;
    },
    deleteProduct: async (id) => {
        await apiClient.delete(`/products/${id}`);
    }
};