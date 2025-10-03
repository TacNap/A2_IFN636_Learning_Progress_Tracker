import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5001', // local
  //baseURL: 'http://3.27.235.24:5001', // live test
  headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;
