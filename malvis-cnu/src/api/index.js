import axios from "axios";

const instance = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
  baseURL: "http://localhost:8080",
});

export const createPost = (data) => {
  return instance.post();
};
