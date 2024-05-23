import "./UploadFile.css";

import { useRef, useEffect, useCallback, useState } from "react";

const UploadFile = ({ onUpload }) => {
  const inputEl = useRef(null);
  const [fileName, setFileName] = useState("");
  const fileInputHandler = useCallback(
    (event) => {
      const files = event.target && event.target.files;
      if (files && files[0]) {
        setFileName(event.target.files[0].name);
        onUpload(event.target.files[0]);
      }
    },
    [onUpload]
  );

  useEffect(() => {
    if (inputEl.current !== null) {
      inputEl.current.addEventListener("input", fileInputHandler);
    }
    return () => {
      inputEl.current &&
        inputEl.current.removeEventListener("input", fileInputHandler);
    };
  }, [inputEl, fileInputHandler]);

  return (
    <>
      <label htmlFor="file">
        {fileName ? (
          <div className="file-name">{fileName}</div>
        ) : (
          <div className="msg">
            파일을 업로드 하세요 <br /> (.csv, .json, .txt)
          </div>
        )}
        <div className="file_btn">파일 선택</div>
      </label>
      <input type="file" id="file" accept=".csv, .json, .txt" ref={inputEl} />
    </>
  );
};

export default UploadFile;
