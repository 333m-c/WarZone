/**
 * Axios instance สำหรับเรียก API
 */

import axios from 'axios';

// สร้าง axios instance พร้อม base URL จาก environment variable
// เช่น: baseURL = "https://tesa-api.crma.dev/api"
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export default axiosInstance;
