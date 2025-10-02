import axios from 'axios';

const axiosInstance = axios.create({
  //baseURL: 'http://localhost:5001', // local
  baseURL: 'http://54.252.14.127:5001', // live
  headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;
