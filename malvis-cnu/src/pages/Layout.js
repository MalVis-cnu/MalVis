import { useState } from "react";
import Aside from "../components/aside/Aside";
import Main from "../components/main/Main";

import "./Layout.css";

const Layout = () => {
  const [result, setResult] = useState({});
  const [dataForHierarchy, setDataForHierarchy] = useState(null);

  const handleResult = (result) => {
    setResult(result);
    setDataForHierarchy(processResult(result.data));
  };

  return (
    <div className="layout">
      <Aside className="aside" onSendResult={handleResult} />
      <Main data={dataForHierarchy} />
    </div>
  );
};

function processResult(result) {
  let arr = new Array(result.children.length).fill(0);
  let l = result.hash.length;

  const reverse_labels = new Array(result.labels.length).fill(-1);
  for (let i in result.labels) {
    reverse_labels[result.labels[i]] = i;
  }

  for (let i in result.children) {
    const a = result.children[i][0];
    const b = result.children[i][1];

    if (a < l && b < l) {
      const struct_a = {
        type: "leaf",
        // name: result.hash[reverse_labels[a]],
        name: "",
        value: 0,
        children: [],
      };
      const struct_b = {
        type: "leaf",
        // name: result.hash[reverse_labels[b]],
        name: "",
        value: 0,
        children: [],
      };
      const parent = {
        type: "node",
        name: i,
        value: result.distances[i],
        children: [struct_a, struct_b],
      };
      arr[i] = parent;
    } else if (a < l && b >= l) {
      const struct_a = {
        type: "leaf",
        // name: result.hash[reverse_labels[a]],
        name: "",
        value: 0,
        children: [],
      };
      const parent = {
        type: "node",
        name: i,
        value: result.distances[i],
        children: [struct_a, arr[b - l]],
      };
      arr[i] = parent;
    } else if (a >= l && b >= l) {
      const parent = {
        type: "node",
        name: i,
        value: result.distances[i],
        children: [arr[a - l], arr[b - l]],
      };
      arr[i] = parent;
    }
  }

  const root = arr[arr.length - 1];
  return root;
}

export default Layout;
