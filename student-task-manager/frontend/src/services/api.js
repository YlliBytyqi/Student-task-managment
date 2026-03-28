import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // ose porta përkatëse
});

// Sigurohemi që të dërgojmë token-in në çdo kërkesë të mbrojtur
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["Content-Type"] = "application/json";
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
