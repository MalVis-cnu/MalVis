import "./Aside.css";
import Button from "../UI/Button";
import UploadFile from "../UI/UploadFile";
import InputModal from "../UI/InputModal";
import { useState } from "react";
import { createPost } from "../../api";

const Aside = ({ onSendResult }) => {
  const [modal, setModal] = useState(false);
  const [inputData, setInputData] = useState({});
  const [isUploaded, setIsUploaded] = useState(false);

  const handleModal = (value) => {
    setModal(value);
  };

  const sendInputData = (inputData) => {
    setInputData(inputData);
  };

  const uploadData = (data) => {
    setInputData({ ...inputData, seq_data: data });
    setIsUploaded(true);
  };

  const handleSubmit = async () => {
    if (!isUploaded) {
      return alert("분석할 데이터 파일을 업로드해주세요.");
    }
    const response = await createPost({ seq_data: inputData.seq_data });
    console.log(response);
    onSendResult(response);
  };

  return (
    <>
      {modal ? <InputModal onShow={handleModal} onSend={sendInputData} /> : ""}
      <aside className="side-bar">
        <UploadFile onUpload={uploadData} />
        <Button onClick={() => handleModal(true)}>설정</Button>
        <Button onClick={handleSubmit} className="start">
          분석 시작
        </Button>
      </aside>
    </>
  );
};

export default Aside;
