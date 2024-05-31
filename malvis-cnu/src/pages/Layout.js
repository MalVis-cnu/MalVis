import { useCallback, useState, useEffect, useRef } from "react";
import Aside from "../components/aside/Aside";
import Main from "../components/main/Main";
import InputModal from "../components/UI/InputModal";
import { createPost } from "../api";
import Button from "../components/UI/Button";
import UploadFile from "../components/UI/UploadFile";

import "./Layout.css";

const Layout = () => {
  const [result, setResult] = useState(null);
  const [dataForHierarchy, setDataForHierarchy] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [clusters, setClusters] = useState(null);

  const [modal, setModal] = useState(false);
  const [inputData, setInputData] = useState({});
  const [isUploaded, setIsUploaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [isOpen, setOpen] = useState(true);
  const [clicked, setClicked] = useState("");
  // const [xPosition, setX] = useState(-width);

  const side = useRef();

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

  const handleModal = (value) => {
    setModal(value);
  };

  const handleClusters = useCallback((subClusters) => {
    setClusters(subClusters);
    setClicked("edge");
  }, []);

  const sendInputData = (sendedInputData) => {
    if (sendedInputData.algorithm === "hierarchical") {
      const { algorithm, n_gram, link, cluster } = sendedInputData;
      setInputData({
        ...inputData,
        algorithm,
        n_gram,
        link,
        cluster,
      });
    }
  };

  const uploadData = (data) => {
    setInputData({ ...inputData, seq_data: data });
    setIsUploaded(true);
  };

  const handleSubmit = async () => {
    if (!isUploaded) {
      return alert("분석할 데이터 파일을 업로드해주세요.");
    }
    setIsProcessing(true);
    const response = await createPost({ seq_data: inputData.seq_data });
    setIsProcessing(false);
    setOpen(false);
    handleResult(response);
  };

  const toggleMenu = () => {
    setOpen(!isOpen);
  };

  const handleClose = (e) => {
    let sideArea = side.current;
    if (isOpen && !sideArea) {
      setOpen(false);
    }
  };

  const downloadJsonFile = () => {
    let element = document.createElement("a");
    let text = JSON.stringify(result);
    element.setAttribute(
      "href",
      "data:text/json;charset=utf-8," + encodeURIComponent(text)
    );
    element.setAttribute("download", "result.json");
    element.style.display = "none"; //하이퍼링크 요소가 보이지 않도록 처리
    document.body.appendChild(element); //DOM body요소에 하이퍼링크 부착
    element.click(); //클릭 이벤트 트리거 - 이 시점에 다운로드 발생
    document.body.removeChild(element); //하이퍼링크 제거
  };

  useEffect(() => {
    window.addEventListener("click", handleClose);
    return () => {
      window.removeEventListener("click", handleClose);
    };
  });

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
      <button className="side-btn" onClick={toggleMenu}>
        {isOpen ? "➡" : "⬅"}
      </button>
      {isOpen ? (
        <div className="right-sidebar" ref={side}>
          {modal ? (
            <InputModal onShow={handleModal} onSend={sendInputData} />
          ) : (
            ""
          )}
          <UploadFile onUpload={uploadData} />
          <Button onClick={() => handleModal(true)}>설정</Button>
          <Button
            onClick={handleSubmit}
            className={isProcessing ? "processing" : "start"}
            isDisabled={isProcessing}
          >
            {isProcessing ? "분석 중..." : "분석 시작"}
          </Button>
          <Button onClick={downloadJsonFile}>다운로드</Button>
        </div>
      ) : null}
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
        i: reverse_labels[a],
        name: result.hash[reverse_labels[a]],
        value: 0,
        children: [],
      };
      const struct_b = {
        type: "leaf",
        i: reverse_labels[b],
        name: result.hash[reverse_labels[b]],
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
        i: reverse_labels[a],
        name: result.hash[reverse_labels[a]],
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
