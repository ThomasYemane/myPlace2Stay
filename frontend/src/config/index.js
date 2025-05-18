const API_BASE_URL = import.meta.env.MODE === 'production'
  ? 'https://place2stay-backend.onrender.com'
  : 'http://localhost:8000';

export default API_BASE_URL;
