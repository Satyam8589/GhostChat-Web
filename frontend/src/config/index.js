import axios from "axios";

export const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const clientServer = axios.create({
  baseURL: BASE_URL,
});
