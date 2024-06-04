import axios from "axios";

const instance = axios.create({
  headers: {
    "Content-Type": "multipart/form-data",
  },
  baseURL: "http://localhost:8888",
});

// export const requestHierarchicalClustring = (data) => {
//   return instance.post("/cluster/hierarchical", data);
// };

export const requestHierarchicalClustring = (data) => {
  return instance.post("/cluster", data);
};

export const requestKmeansClustering = (data) => {
  return instance.post("/cluster/kmeans", data);
};

export const requestUpload = (data) => {
  return instance.post("/upload", data);
};
