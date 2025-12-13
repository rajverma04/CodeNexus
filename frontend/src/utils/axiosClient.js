import axios from "axios";

const axiosClient = axios.create({
    baseURL: import.meta.env.REACT_APP_API_BASE_URL || "http://localhost:4000",
    withCredentials: true,      // it means we are telling to attach cookie with this automatically
    headers: {
        'Content-Type': 'application/json'      // data type is json
    }
})

export default axiosClient;