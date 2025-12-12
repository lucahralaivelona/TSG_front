import axios from 'axios';

const API_URL = process.env.VUE_APP_API_URL || 'https://tsg-back.onrender.com/api';

const authService = {
  async login(credentials) {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    
    if (response.data.token) {
      this.setToken(response.data.token);
      this.setUser(response.data.user);
    }
    
    return response.data;
  },
  
  async register(userData) {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    
    if (response.data.token) {
      this.setToken(response.data.token);
      this.setUser(response.data.user);
    }
    
    return response.data;
  },
  
  async verifyToken() {
    const token = this.getToken();
    
    if (!token) {
      throw new Error('Token manquant');
    }
    
    try {
      const response = await axios.get(`${API_URL}/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      this.logout();
      throw error;
    }
  },
  
  setToken(token) {
    // Stocker dans localStorage ou sessionStorage selon le choix
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },
  
  getToken() {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  },
  
  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  },
  
  getUser() {
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  },
  
  isAuthenticated() {
    return !!this.getToken();
  }
};

// Intercepteur pour ajouter le token automatiquement
axios.interceptors.request.use(
  config => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs d'authentification
/* axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      authService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
); */

export default authService;