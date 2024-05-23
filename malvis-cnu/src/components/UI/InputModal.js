import { useState } from "react";
import { createPortal } from "react-dom";

import "./InputModal.css";

const InputModal = ({ onShow, onSend }) => {
  const [algorithm, setAlgorithm] = useState("hierarchical");

  const [hierarchicalValues, setHierarchicalValues] = useState({
    algorithm: "hierarchical",
    n_gram: "2",
    link: "single",
    cluster: "2",
  });

  const { n_gram, link, cluster } = hierarchicalValues;

  const handleSelectedAlgorithm = (event) => {
    setAlgorithm(event.target.value);
  };

  const handleHierarchicalInput = (event) => {
    const { id, value } = event.target;
    setHierarchicalValues({
      ...hierarchicalValues,
      [id]: value,
    });
  };

  const handleConfirm = (event) => {
    event.preventDefault();
    if (algorithm === "hierarchical") {
      console.log(hierarchicalValues);
      onSend(hierarchicalValues);
    } else if (algorithm === "K-means") {
      return {};
    }
    onShow(false);
  };

  const handleCancel = (event) => {
    event.preventDefault();
    onShow(false);
  };

  return createPortal(
    <dialog className="input-modal" open>
      <form method="dialog" className="format">
        <div>
          <label htmlFor="algorithms" className="name">
            Clustering Algorithm
          </label>
          <div id="algorithms">
            <div className="hier-opt">
              <input
                type="radio"
                id="hierarchical"
                name="clustering"
                value="hierarchical"
                defaultChecked={true}
                onChange={handleSelectedAlgorithm}
              />
              <label htmlFor="hierarchical">Hierarchical</label>
            </div>
            <div>
              <input
                type="radio"
                id="K-means"
                name="clustering"
                value="K-means"
                onChange={handleSelectedAlgorithm}
              />
              <label htmlFor="K-means">K-means</label>
            </div>
          </div>
        </div>
        {algorithm === "hierarchical" ? (
          <div>
            <div className="item-of-hier">
              <label htmlFor="n_gram" className="name">
                n-gram
              </label>
              <input
                id="n_gram"
                type="number"
                min="2"
                value={n_gram}
                className="input-number"
                onChange={handleHierarchicalInput}
              />
            </div>
            <div className="item-of-hier">
              <label htmlFor="link" className="name">
                링크 방식
              </label>
              <select id="link" value={link} onChange={handleHierarchicalInput}>
                <option value="single">Single</option>
                <option value="complete">complete</option>
                <option value="average">Average</option>
              </select>
            </div>
            <div className="item-of-hier">
              <label htmlFor="cluster" className="name">
                클러스터 개수
              </label>
              <input
                id="cluster"
                type="number"
                value={cluster}
                className="input-number"
                onChange={handleHierarchicalInput}
              />
            </div>
          </div>
        ) : null}
        {algorithm === "K-means" ? (
          <div>
            <label htmlFor="k" className="name">
              K 값(cluster 수) 설정
            </label>
            <br />
            <input type="number" id="k" min="1" className="input-number" />
          </div>
        ) : null}
        <br />
        <footer className="footer">
          <button className="cancel_btn" onClick={handleCancel}>
            취소
          </button>
          <button className="apply_btn" onClick={handleConfirm}>
            적용
          </button>
        </footer>
      </form>
    </dialog>,
    document.getElementById("modal")
  );
};

export default InputModal;
