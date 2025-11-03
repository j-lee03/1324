import axios from "axios";

const api = axios.create({
  // 👇 이 줄이 빠졌거나 잘못되었을 것입니다.
  baseURL: "http://127.0.0.1:8000",
});

export default api;