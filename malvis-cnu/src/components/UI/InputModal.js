import { useState } from "react";
import { createPortal } from "react-dom";

import "./InputModal.css";

const InputModal = ({ onShow, onSend }) => {
  const [similarityValues, setSimilarityValues] = useState({
    similarity: "jaccard",
    n_gram: "2",
  });
  const [algorithm, setAlgorithm] = useState("hierarchical");

  const [hierarchicalValues, setHierarchicalValues] = useState({
    algorithm: "hierarchical",
    link: "single",
    cluster: "2",
  });

  const [kmeansValues, setKmeansValues] = useState({
    algorithm: "kmeans",
    max_iter: "100",
    k: "2",
  });

  const { similarity, n_gram } = similarityValues;
  const { link, cluster } = hierarchicalValues;
  const { max_iter, k } = kmeansValues;

  const handleSelectedSimilarity = (event) => {
    const { id, value } = event.target;

    setSimilarityValues({
      ...similarityValues,
      [id]: value,
    });
  };

  const handleSelectedAlgorithm = (event) => {
    setAlgorithm(event.target.value);
  };

  const handleInput = (event) => {
    const { id, value } = event.target;

    if (algorithm === "hierarchical") {
      setHierarchicalValues({
        ...hierarchicalValues,
        [id]: value,
      });
    } else if (algorithm === "kmeans") {
      setKmeansValues({
        ...kmeansValues,
        [id]: value,
      });
    }
  };

  const exceptionChecker = () => {
    if (n_gram < 2) {
      alert("2 이상의 정수를 입력해주세요.");
      setSimilarityValues({ ...similarityValues, n_gram: 2 });
    } else if (cluster < 2) {
      alert("2 이상의 정수를 입력해주세요.");
      setHierarchicalValues({
        ...hierarchicalValues,
        cluster: 2,
      });
    } else if (max_iter < 1) {
      alert("1 이상의 정수를 입력해주세요.");
      setKmeansValues({
        ...kmeansValues,
        max_iter: 100,
      });
    } else if (k < 1) {
      alert("1 이상의 정수를 입력해주세요.");
      setKmeansValues({
        ...kmeansValues,
        k: 2,
      });
    }
  };

  const handleConfirm = (event) => {
    event.preventDefault();
    if (algorithm === "hierarchical") {
      onSend({ ...hierarchicalValues, similarity, n_gram });
    } else if (algorithm === "kmeans") {
      onSend({
        ...kmeansValues,
        similarity,
        n_gram,
      });
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
          <label htmlFor="similarity" className="name">
            Similarity Algorithm
          </label>
          <div id="similarity">
            <div className="jaccard-opt">
              <input
                type="radio"
                id="jaccard"
                name="similarity"
                value="jaccard"
                defaultChecked={true}
                onChange={handleSelectedSimilarity}
              />
              <label htmlFor="jaccard">Jaccard</label>
            </div>
            <div>
              <input
                type="radio"
                id="cosine"
                name="similarity"
                value="cosine"
                onChange={handleSelectedSimilarity}
              />
              <label htmlFor="cosine">Cosine</label>
            </div>
          </div>
          <div className="item-of-hier">
            <label htmlFor="n_gram" className="name">
              n-gram(2 이상 정수)
            </label>
            <input
              id="n_gram"
              name="n_gram"
              type="number"
              min="2"
              value={n_gram}
              className="input-number"
              onChange={handleSelectedSimilarity}
              onBlur={exceptionChecker}
            />
          </div>
        </div>
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
                id="kmeans"
                name="clustering"
                value="kmeans"
                onChange={handleSelectedAlgorithm}
              />
              <label htmlFor="kmeans">kmeans</label>
            </div>
          </div>
        </div>
        {algorithm === "hierarchical" ? (
          <div>
            <div className="item-of-hier">
              <label htmlFor="link" className="name">
                링크 방식
              </label>
              <select id="link" name="link" value={link} onChange={handleInput}>
                <option value="single">Single</option>
                <option value="complete">complete</option>
                <option value="average">Average</option>
              </select>
            </div>
            <div className="item-of-hier">
              <label htmlFor="cluster" className="name">
                클러스터 개수(2 이상 정수)
              </label>
              <input
                id="cluster"
                name="cluster"
                type="number"
                value={cluster}
                className="input-number"
                onChange={handleInput}
                onBlur={exceptionChecker}
              />
            </div>
          </div>
        ) : null}
        {algorithm === "kmeans" ? (
          <>
            <div>
              <label htmlFor="max_iter" className="name">
                max iteration
              </label>
              <input
                type="number"
                id="max_iter"
                min="1"
                className="input-number"
                value={max_iter}
                onChange={handleInput}
                onBlur={exceptionChecker}
              />
            </div>
            <div>
              <label htmlFor="k" className="name">
                K 값(cluster 수)
              </label>
              <input
                type="number"
                id="k"
                min="1"
                className="input-number"
                value={k}
                onChange={handleInput}
                onBlur={exceptionChecker}
              />
            </div>
          </>
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
