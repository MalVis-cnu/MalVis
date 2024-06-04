import { useCallback, useState, useRef } from "react";
import Aside from "../components/aside/Aside";
import Main from "../components/main/Main";

import "./Layout.css";
import SideMenu from "../components/UI/SideMenu";

const Layout = () => {
  const [result, setResult] = useState(null);
  const [dataForHierarchy, setDataForHierarchy] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [clusters, setClusters] = useState(null);

  const [clicked, setClicked] = useState("");

  const handleResult = (result) => {
    setResult(result);
    setDataForHierarchy(processResult(result.data));
  };

  const sendDetail = useCallback((node) => {
    setNodes((nodes) => {
      if (nodes.length < 2) {
        const newNodes = nodes.filter(({ idx }) => idx !== node.idx);
        newNodes.push(node);
        return newNodes;
      } else {
        return [node];
      }
    });
    setClicked("node");
  }, []);

  const handleClusters = useCallback((subClusters) => {
    setClusters(subClusters);
    setClicked("edge");
  }, []);

  return (
    <div className="layout">
      <Aside
        className="aside"
        nodes={nodes}
        results={result}
        clusters={clusters}
        clicked={clicked}
      />
      <Main
        data={dataForHierarchy}
        onSendDetail={sendDetail}
        onSendClusters={handleClusters}
      />
      <SideMenu result={result} onHandleResult={handleResult} />
    </div>
  );
};

function processResult(result) {
  let arr = new Array(result.children.length).fill(0);
  let l = result.hash.length;

  for (let i in result.children) {
    const a = result.children[i][0];
    const b = result.children[i][1];

    if (a < l && b < l) {
      const struct_a = {
        type: "leaf",
        i: a,
        name: result.hash[a],
        value: 0,
        children: [],
      };
      const struct_b = {
        type: "leaf",
        i: b,
        name: result.hash[b],
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
        i: a,
        name: result.hash[a],
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
