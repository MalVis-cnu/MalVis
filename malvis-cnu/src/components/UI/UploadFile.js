import "./UploadFile.css";

import { useRef, useEffect, useCallback, useState } from "react";

const UploadFile = ({ onUpload, fileFromLayout }) => {
  const inputEl = useRef(null);
  const [fileName, setFileName] = useState("");
  const fileInputHandler = useCallback((event) => {
    const files = event.target && event.target.files;
    if (files && files[0]) {
      const maxSize = 500 * 1024 * 1024;
      if (files[0].size > maxSize) {
        return alert("파일 크기는 500MB 미만이어야 합니다.");
      }
      setFileName(event.target.files[0].name);
      console.log(event.target.files[0]);
      if (event.target.files[0] !== null) {
        onUpload(event.target.files[0]);
      }
    }
  }, []);

  useEffect(() => {
    if (inputEl.current !== null) {
      inputEl.current.addEventListener("input", fileInputHandler);
    }

    if (fileFromLayout) {
      setFileName(fileFromLayout.name);
    }

    return () => {
      inputEl.current &&
        inputEl.current.removeEventListener("input", fileInputHandler);
    };
  }, [inputEl, fileInputHandler, fileFromLayout]);

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
