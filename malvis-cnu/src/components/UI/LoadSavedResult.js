import { useEffect, useRef } from "react";
import { requestUpload } from "../../api";

import "./LoadSavedResult.css";

const LoadSavedResult = ({ resultHandler }) => {
  const inputEl = useRef(null);

  const handleLoadResult = async (event) => {
    const savedFile = event.target.files[0];
    const response = await requestUpload({ processed_data: savedFile });
    resultHandler(response);
  };

  useEffect(() => {
    if (inputEl.current !== null) {
      inputEl.current.addEventListener("input", handleLoadResult);
    }
    return () => {
      inputEl.current &&
        inputEl.current.removeEventListener("input", handleLoadResult);
    };
  }, [inputEl, handleLoadResult]);

  return (
    <>
      <label htmlFor="file">
        <div className="load_btn">불러오기</div>
      </label>
      <input type="file" id="file" accept=".csv, .json, .txt" ref={inputEl} />
    </>
  );
};

export default LoadSavedResult;
