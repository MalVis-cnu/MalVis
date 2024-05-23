import axios from "axios";

const instance = axios.create({
  headers: {
    "Content-Type": "multipart/form-data",
  },
  baseURL: "http://localhost:8888",
});

export const createPost = (data) => {
  return instance.post("/cluster", data);
};
