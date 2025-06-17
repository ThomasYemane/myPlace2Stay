const API_BASE_URL = import.meta.env.MODE === 'production'
  ? 'https://myplace2stay.onrender.com'
  : 'http://localhost:8000';

export default API_BASE_URL;
