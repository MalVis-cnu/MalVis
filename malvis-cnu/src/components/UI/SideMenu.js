import { useState, useRef, useEffect } from "react";
import InputModal from "./InputModal";
import {
  requestHierarchicalClustring,
  requestKmeansClustering,
} from "../../api";
import Button from "./Button";
import UploadFile from "./UploadFile";

import "./SideMenu.css";
import LoadSavedResult from "./LoadSavedResult";

const SideMenu = ({ result, onHandleResult, droppedFile }) => {
  const [modal, setModal] = useState(false);
  const [inputData, setInputData] = useState({
    algorithm: "hierarchical",
    similarity: "jaccard",
    n_gram: "2",
    link: "single",
    cluster: "2",
  });
  const [isUploaded, setIsUploaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const side = useRef();

  const handleModal = (value) => {
    setModal(value);
  };

  const sendInputData = (sendedInputData) => {
    console.log(sendedInputData);
    if (sendedInputData.algorithm === "hierarchical") {
      const { algorithm, similarity, n_gram, link, cluster } = sendedInputData;
      setInputData({
        ...inputData,
        algorithm,
        similarity,
        n_gram,
        link,
        cluster,
      });
    } else if (sendedInputData.algorithm === "kmeans") {
      const { algorithm, similarity, n_gram, max_iter, k } = sendedInputData;
      setInputData({
        ...inputData,
        algorithm,
        similarity,
        n_gram,
        max_iter,
        k,
      });
    }
  };

  const uploadData = (data) => {
    setInputData({ ...inputData, seq_data: data });
    setIsUploaded(true);
  };

  const errorHandler = (error) => {
    if (error.response) {
      const errorText = error.response.data;
      return alert(errorText);
    }
  };

  const handleSubmit = async () => {
    if (inputData.seq_data === undefined) {
      return alert("분석할 데이터 파일을 업로드해주세요.");
    }

    setIsProcessing(true);
    try {
      if (inputData.algorithm === "hierarchical") {
        const response = await requestHierarchicalClustring(inputData);
        onHandleResult(response);
      } else if (inputData.algorithm === "kmeans") {
        const response = await requestKmeansClustering(inputData);
        onHandleResult(response);
      }
      setIsOpen(false);
    } catch (error) {
      errorHandler(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const downloadJsonFile = () => {
    const element = document.createElement("a");
    const text = JSON.stringify(result.data);
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

  const handleLoadedResult = (data) => {
    console.log(data);
    onHandleResult(data);
  };

  useEffect(() => {
    uploadData(droppedFile);
    setIsOpen(true);
  }, [droppedFile]);

  return (
    <div className="right-sidebar-container">
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
          <UploadFile onUpload={uploadData} fileFromLayout={droppedFile} />
          <Button onClick={() => handleModal(true)}>설정</Button>
          <Button
            onClick={handleSubmit}
            className={isProcessing ? "processing" : "start"}
            isDisabled={isProcessing}
          >
            {isProcessing ? "분석 중..." : "분석 시작"}
          </Button>
          <div className="additional-functions">
            <Button
              onClick={downloadJsonFile}
              className={result ? "download" : "prevent-download"}
              isDisabled={result ? false : true}
            >
              결과 다운로드
            </Button>
            <LoadSavedResult resultHandler={handleLoadedResult} />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default SideMenu;
