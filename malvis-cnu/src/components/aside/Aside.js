import { useRef, useState, useEffect } from "react";
import Accordion from "../UI/Accordion";
import "./Aside.css";

const Aside = ({ nodes, results, clusters, clicked }) => {
  const asideRef = useRef(null);

  const [isResizing, setIsResizing] = useState(false);
  const [initialX, setInitialX] = useState(0);
  const [width, setWidth] = useState(300);

  const pairs = {};

  if (results) {
    console.log(results);
    asideRef.current.style.display = "flex";
  }

  if (results && results.data === undefined) {
    results = { data: results };
  }

  if (results && results.data !== undefined && nodes.length === 2) {
    for (let i = 0; i < results.data.sequence_data[0].length; i++) {
      pairs[i] = [];
    }

    nodes.forEach(({ idx, name }) => {
      results.data.sequence_data[idx].map((api_idx, i) =>
        pairs[i].push(api_idx)
      );
    });
  }

  const handleMouseDown = (event) => {
    event.preventDefault();

    setIsResizing(true);
    setInitialX(event.clientX);
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  const handleMouseMove = (event) => {
    if (isResizing) {
      const newWidth = width + event.clientX - initialX;

      if (newWidth >= 300 && newWidth <= 800) {
        setWidth(newWidth);
      }
    }
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  return (
    <aside className="aside" ref={asideRef} style={{ width }}>
      <div className="side-bar">
        {results ? (
          <>
            <div style={{ paddingLeft: "8px", height: "3%" }}>
              <span>
                <strong>전체 실루엣 계수 : </strong>
              </span>
              <span>{results.data.silhouette_score.toFixed(5)}</span>
            </div>
            <div style={{ padding: "8px" }}>
              <h3 style={{ margin: "0 0 8px 0" }}>{"<<< 분석 옵션 >>>"}</h3>
              <div>
                <span>
                  <strong>Similarity : </strong>
                </span>
                <span>{results.data.option.similarity_method}</span>
              </div>
              <div>
                <span>
                  <strong>n-gram : </strong>
                </span>
                <span>{results.data.option.similarity_option.ngram}</span>
              </div>
              <div>
                <span>
                  <strong>Clustering Algorithm : </strong>
                </span>
                <span>{results.data.option.clustering_method}</span>
              </div>
              <div>
                {results.data.option.clustering_method === "hierarchical" ? (
                  <>
                    <span>
                      <strong>링크 방식 : </strong>
                    </span>
                    <span>{results.data.option.clustering_option.linkage}</span>
                  </>
                ) : (
                  <>
                    <span>
                      <strong>Max iteration : </strong>
                    </span>
                    <span>
                      {results.data.option.clustering_option.max_iteration}
                    </span>
                  </>
                )}
              </div>
              <div>
                <span>
                  <strong>클러스터 개수 : </strong>
                </span>
                <span>
                  {results.data.option.clustering_option.n_cluster ||
                    results.data.option.clustering_option.k}
                </span>
              </div>
              <div>
                <span>
                  <strong>데이터 파싱 소요시간 : </strong>
                </span>
                <span>{results.data.time.input_time}</span>
              </div>
              <div>
                <span>
                  <strong>유사도 계산 소요 시간 : </strong>
                </span>
                <span>{results.data.time.similarity_time}</span>
              </div>
              <div>
                <span>
                  <strong>클러스터링 소요 시간 : </strong>
                </span>
                <span>{results.data.time.clustering_time}</span>
              </div>
              <div>
                <span>
                  <strong>총 소요 시간 : </strong>
                </span>
                <span>{results.data.time.total_time}</span>
              </div>
            </div>
          </>
        ) : null}
        {clusters && clicked === "edge" ? (
          <div
            style={{ paddingLeft: "8px", height: "60%", overflow: "scroll" }}
          >
            <div>
              {"두 클러스터 간 거리 : " + clusters[2].data.value.toFixed(5)}
            </div>
            <div>
              <h3>Right Cluster</h3>
              {clusters[0].map((c, i) => (
                <div key={i}>{c.length >= 7 ? c.slice(0, 7) + "..." : c}</div>
              ))}
            </div>
            <div>
              <h3>Left Cluster</h3>
              {clusters[1].map((c, i) => (
                <div key={i}>{c.length >= 7 ? c.slice(0, 7) + "..." : c}</div>
              ))}
            </div>
          </div>
        ) : null}
        {results && nodes.length === 0 ? null : null}
        {nodes.length === 1 && clicked === "node" ? (
          <div className="seq-list">
            <Accordion
              header="API 시퀀스"
              style={{ height: asideRef.current.clientHeight * 0.6 }}
            >
              <table className="compare-box">
                <thead>
                  <tr>
                    <th>시퀀스</th>
                    <th>
                      {nodes[0].name.length >= 7
                        ? nodes[0].name.slice(0, 7) + "..."
                        : nodes[0].name}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {results.data.sequence_data[nodes[0].idx].map(
                    (api_idx, i) => (
                      <tr key={i}>
                        <td className="border-line">
                          t<sub>{i}</sub>
                        </td>
                        <td className="border-line">{api_idx}</td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </Accordion>
          </div>
        ) : (
          ""
        )}

        {nodes.length === 2 && clicked === "node" ? (
          <>
            <div style={{ margin: "0 8px 8px 8px" }}>
              <span>
                <strong>두 악성코드 간 유사도: </strong>
              </span>
              <span>{`${(
                1 - results.data.distance_matrix[nodes[0].idx][nodes[1].idx]
              ).toFixed(5)}`}</span>
            </div>
            <div>
              <Accordion
                header="API 시퀀스 비교"
                style={{ height: asideRef.current.clientHeight * 0.55 }}
              >
                <table className="compare-box">
                  <thead>
                    <tr>
                      <th>시퀀스</th>
                      <th>
                        {nodes[0].name.length >= 7
                          ? nodes[0].name.slice(0, 7) + "..."
                          : nodes[0].name}
                      </th>
                      <th>
                        {nodes[1].name.length >= 7
                          ? nodes[1].name.slice(0, 7) + "..."
                          : nodes[1].name}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="">
                    {Object.keys(pairs).map((pair_num, i) => (
                      <tr key={i}>
                        <td className="border-line">
                          t<sub>{i}</sub>
                        </td>
                        <td className="border-line">{pairs[pair_num][0]}</td>
                        <td className="border-line">{pairs[pair_num][1]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Accordion>
            </div>
            <div className="similar-seq-list">
              <Accordion
                header="유사 시퀀스 목록"
                style={{ height: asideRef.current.clientHeight * 0.45 }}
              >
                <table className="compare-box">
                  <tbody>
                    {results.data.similar_sequence_matrix[nodes[0].idx][
                      nodes[1].idx
                    ].map((sim_seq, i) => (
                      <tr key={i}>
                        <td className="border-line">
                          {sim_seq.replace(",", " ->")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Accordion>
            </div>
          </>
        ) : (
          ""
        )}
      </div>
      <div
        className="aside-border-line"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      ></div>
    </aside>
  );
};

export default Aside;
