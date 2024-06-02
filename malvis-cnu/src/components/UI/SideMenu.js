import { useState, useEffect, useRef } from "react";
import InputModal from "./InputModal";
import { createPost } from "../../api";
import Button from "./Button";
import UploadFile from "./UploadFile";

import "./SideMenu.css";

const SideMenu = ({ result, onHandleResult }) => {
  const [modal, setModal] = useState(false);
  const [inputData, setInputData] = useState({});
  const [isUploaded, setIsUploaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOpen, setOpen] = useState(true);

  const side = useRef();

  const handleModal = (value) => {
    setModal(value);
  };

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
    onHandleResult(response);
  };

  const handleClose = (e) => {
    let sideArea = side.current;
    if (isOpen && !sideArea) {
      setOpen(false);
    }
  };

  const toggleMenu = () => {
    setOpen(!isOpen);
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

  useEffect(() => {
    window.addEventListener("click", handleClose);
    return () => {
      window.removeEventListener("click", handleClose);
    };
  }, []);

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
          <UploadFile onUpload={uploadData} />
          <Button onClick={() => handleModal(true)}>설정</Button>
          <Button
            onClick={handleSubmit}
            className={isProcessing ? "processing" : "start"}
            isDisabled={isProcessing}
          >
            {isProcessing ? "분석 중..." : "분석 시작"}
          </Button>
          <Button
            onClick={downloadJsonFile}
            className={result ? "download" : "prevent-download"}
            isDisabled={result ? false : true}
          >
            결과 다운로드
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default SideMenu;
