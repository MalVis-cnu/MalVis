import { useEffect, useRef } from "react";
import { requestUpload } from "../../api";

import "./LoadSavedResult.css";

const LoadSavedResult = ({ resultHandler }) => {
  const loadEl = useRef(null);

  const handleLoadResult = async (event) => {
    const savedFile = event.target.files[0];
    const response = await requestUpload({ processed_data: savedFile });
    resultHandler(response);
  };

  useEffect(() => {
    if (loadEl.current !== null) {
      loadEl.current.addEventListener("change", handleLoadResult);
    }
    return () => {
      loadEl.current &&
        loadEl.current.addEventListener("change", handleLoadResult);
    };
  }, [loadEl, handleLoadResult]);

  return (
    <>
      <label htmlFor="load">
        <div className="load_btn">불러오기</div>
      </label>
      <input type="file" id="load" accept=".json" ref={loadEl} />
    </>
  );
};

export default LoadSavedResult;
