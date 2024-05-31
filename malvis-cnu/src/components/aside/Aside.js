import "./Aside.css";
import Button from "../UI/Button";
import UploadFile from "../UI/UploadFile";
import InputModal from "../UI/InputModal";
import { useState } from "react";
import { createPost } from "../../api";

const Aside = ({ onSendResult, nodes, results }) => {
  const [modal, setModal] = useState(false);
  const [inputData, setInputData] = useState({});
  const [isUploaded, setIsUploaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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
    console.log(response);
    setIsProcessing(false);
    onSendResult(response);
  };

  return (
    <>
      {modal ? <InputModal onShow={handleModal} onSend={sendInputData} /> : ""}
      <aside className="side-bar">
        <UploadFile onUpload={uploadData} />
        <Button onClick={() => handleModal(true)}>설정</Button>
        <Button
          onClick={handleSubmit}
          className={isProcessing ? "processing" : "start"}
          isDisabled={isProcessing}
        >
          {isProcessing ? "분석 중..." : "분석 시작"}
        </Button>
        {nodes.length === 1 ? (
          <div style={{ overflow: "scroll", height: "30%" }}>
            <div>{nodes[0].name}</div>
            {results.data.sequence_data[nodes[0].idx].map((api_idx, i) => (
              <div key={i}>{api_idx}</div>
            ))}
          </div>
        ) : (
          ""
        )}
        {nodes.length === 2 ? (
          <div style={{ overflow: "hidden", height: "60%" }}>
            <div style={{ overflow: "scroll", height: "10%" }}>
              {"전체 실루엣 계수" + results.data.silhouette_score}
            </div>
            <div style={{ overflow: "scroll", height: "30%" }}>
              <div>{nodes[0].name}</div>
              {results.data.sequence_data[nodes[0].idx].map((api_idx, i) => (
                <div key={i}>{api_idx}</div>
              ))}
            </div>
            <div style={{ overflow: "scroll", height: "30%" }}>
              <div>{nodes[1].name}</div>
              {results.data.sequence_data[nodes[1].idx].map((api_idx, i) => (
                <div key={i}>{api_idx}</div>
              ))}
            </div>
            <div style={{ overflow: "scroll", height: "30%" }}>
              <div>{`두 악성코드 간 유사도: ${
                results.data.distance_matrix[nodes[0].idx][nodes[1].idx]
              }`}</div>
              {results.data.similar_sequence_matrix[nodes[0].idx][
                nodes[1].idx
              ].map((sim_seq, i) => (
                <div key={i}>{sim_seq}</div>
              ))}
            </div>
          </div>
        ) : (
          ""
        )}
      </aside>
    </>
  );
};

export default Aside;
