import { useEffect, useRef, useState } from "react";
import { requestUpload } from "../../api";

import "./LoadSavedResult.css";

const LoadSavedResult = ({ resultHandler }) => {
  const [isLoading, setIsLoading] = useState(false);

  const loadEl = useRef(null);

  const errorHandler = (error) => {
    if (error.response) {
      const errorText = error.response.data;
      return alert(errorText);
    }
  };

  const handleLoadResult = async (event) => {
    if (event.target && event.target.files.length > 0) {
      const savedFile = event.target.files[0];
      console.log(savedFile);
      setIsLoading(true);
      loadEl.current.disabled = true;
      try {
        const response = await requestUpload({ processed_data: savedFile });
        resultHandler(response);
      } catch (error) {
        errorHandler(error);
      } finally {
        setIsLoading(false);
        loadEl.current.disabled = false;
      }
    }
  };

  useEffect(() => {
    if (loadEl.current !== null) {
      loadEl.current.addEventListener("change", handleLoadResult);
    }
    return () => {
      loadEl.current &&
        loadEl.current.removeEventListener("change", handleLoadResult);
    };
  }, []);

  return (
    <>
      <label htmlFor="load">
        <div className={isLoading ? "now-loading" : "load-btn"}>
          {isLoading ? "로딩 중..." : "불러오기"}
        </div>
      </label>
      <input type="file" id="load" accept=".json" ref={loadEl} />
    </>
  );
};

export default LoadSavedResult;
