import axios from 'axios';

// Get token from either localStorage (rememberMe = true) or sessionStorage (rememberMe = false)
export const getAuthToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token') || null;
};

export const getStoredUser = () => {
  const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    return null;
  }
};

export const setAuthData = (token, user, rememberMe) => {
  if (rememberMe) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  } else {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(user));
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
};

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: automatically attach JWT
API.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 and network errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // Network failure
      return Promise.reject(new Error('Network error, please check your connection'));
    }

    if (error.response.status === 401) {
      clearAuthData();
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export const authService = {
  login: async (credentials) => {
    // Tries /login or /api/login
    try {
      const res = await API.post('/login', credentials);
      return res.data;
    } catch (err) {
      if (err.response?.status === 404) {
        const res = await API.post('/api/login', credentials);
        return res.data;
      }
      throw err;
    }
  },
  register: async (userData) => {
    try {
      const res = await API.post('/register', userData);
      return res.data;
    } catch (err) {
      if (err.response?.status === 404) {
        const res = await API.post('/api/register', userData);
        return res.data;
      }
      throw err;
    }
  },
  getMe: async () => {
    try {
      const res = await API.get('/api/auth/me');
      return res.data;
    } catch (err) {
      throw err;
    }
  },
};

export const taskService = {
  getTasks: async (params) => {
    try {
      const res = await API.get('/tasks', { params });
      return res.data;
    } catch (err) {
      if (err.response?.status === 404) {
        const res = await API.get('/api/tasks', { params });
        return res.data;
      }
      throw err;
    }
  },
  getTaskById: async (id) => {
    try {
      const res = await API.get(`/tasks/${id}`);
      return res.data;
    } catch (err) {
      if (err.response?.status === 404) {
        const res = await API.get(`/api/tasks/${id}`);
        return res.data;
      }
      throw err;
    }
  },
  createTask: async (taskData) => {
    try {
      const res = await API.post('/tasks', taskData);
      return res.data;
    } catch (err) {
      if (err.response?.status === 404) {
        const res = await API.post('/api/tasks', taskData);
        return res.data;
      }
      throw err;
    }
  },
  updateTask: async (id, taskData) => {
    try {
      const res = await API.put(`/tasks/${id}`, taskData);
      return res.data;
    } catch (err) {
      if (err.response?.status === 404) {
        const res = await API.put(`/api/tasks/${id}`, taskData);
        return res.data;
      }
      throw err;
    }
  },
  deleteTask: async (id) => {
    try {
      const res = await API.delete(`/tasks/${id}`);
      return res.data;
    } catch (err) {
      if (err.response?.status === 404) {
        const res = await API.delete(`/api/tasks/${id}`);
        return res.data;
      }
      throw err;
    }
  },
  getStatsSummary: async () => {
    try {
      const res = await API.get('/tasks/stats/summary');
      return res.data;
    } catch (err) {
      if (err.response?.status === 404) {
        const res = await API.get('/api/tasks/stats/summary');
        return res.data;
      }
      throw err;
    }
  },
};

export const userService = {
  getUsers: async () => {
    try {
      const res = await API.get('/users');
      return res.data;
    } catch (err) {
      if (err.response?.status === 404) {
        const res = await API.get('/api/users');
        return res.data;
      }
      throw err;
    }
  },
};

export default API;
