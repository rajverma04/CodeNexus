import axios from "axios";

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,      // it means we are telling to attach cookie with this automatically
    headers: {
        'Content-Type': 'application/json'      // data type is json
    },
    timeout: 30000 // 30 seconds timeout
})

export default axiosClient;