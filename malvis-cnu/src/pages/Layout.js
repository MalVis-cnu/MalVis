import { useCallback, useState, useRef } from "react";
import Aside from "../components/aside/Aside";
import Main from "../components/main/Main";

import "./Layout.css";
import SideMenu from "../components/UI/SideMenu";
import MainForKmeans from "../components/main/MainForKmeans";

const Layout = () => {
  const [result, setResult] = useState(null);
  const [dataForVisualizing, setDataForVisualizing] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [clusters, setClusters] = useState(null);

  const [clicked, setClicked] = useState("");

  const handleResult = (result) => {
    setResult(result);

    if (result.algorithm === "hierarchical") {
      setDataForVisualizing(processResult(result.data));
    } else if (result.algorithm === "kmeans") {
      setDataForVisualizing(processKmeans(result.data));
    }
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
      {result && result.algorithm === "hierarchical" ? (
        <Main
          data={dataForVisualizing}
          onSendDetail={sendDetail}
          onSendClusters={handleClusters}
        />
      ) : (
        <MainForKmeans data={dataForVisualizing} onSendDetail={sendDetail} />
      )}
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

function processKmeans(result) {
  console.log(result);
  const nodes = [];
  const links = [];
  const centers = result.centers;

  for (let i = 0; i < result.clusters.length; i++) {
    result.clusters[i].forEach((node) => {
      nodes.push({ id: node, group: i });
      links.push({
        source: centers[i],
        target: node,
        length: result.distance_matrix[centers[i]][node],
      });
    });
  }

  return { nodes, links };
}

export default Layout;
