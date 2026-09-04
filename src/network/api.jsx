// src/network/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://203.175.74.144:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;