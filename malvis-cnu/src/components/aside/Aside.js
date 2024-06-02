import "./Aside.css";

const Aside = ({ nodes, results, clusters, clicked }) => {
  return (
    <>
      <aside className="side-bar">
        {results ? (
          <>
            <div style={{ paddingLeft: "8px", height: "5%" }}>
              {"전체 실루엣 계수 : " + results.data.silhouette_score}
            </div>
            <div style={{ padding: "8px" }}>
              {console.log(results)}
              <div>{"<<< 분석 옵션 >>>"}</div>
              <div>
                {"Similarity : " + results.data.option.similarity_method}
              </div>
              <div>
                {"n-gram : " + results.data.option.similarity_option.ngram}
              </div>
              <div>
                {"Clustering Algorithm : " +
                  results.data.option.clustering_method}
              </div>
              <div>
                {"링크 방식 : " + results.data.option.clustering_option.linkage}
              </div>
              <div>
                {"클러스터 개수 : " +
                  results.data.option.clustering_option.n_cluster}
              </div>
            </div>
          </>
        ) : null}
        {clusters && clicked === "edge" ? (
          <div
            style={{ paddingLeft: "8px", height: "60%", overflow: "scroll" }}
          >
            <div>{"두 클러스터 간 거리 : " + clusters[2].data.value}</div>
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
        {nodes.length === 1 && clicked === "node" ? (
          <div style={{ overflow: "scroll", height: "62%" }}>
            <div className="compare-box">
              <div className="compare-item-seq">
                <div>시퀀스</div>
                {results.data.sequence_data[nodes[0].idx].map((d, i) => (
                  <div className="border-line">{"t_" + i}</div>
                ))}
              </div>
              <div className="compare-item-one">
                <div>
                  {nodes[0].name.length >= 7
                    ? nodes[0].name.slice(0, 7) + "..."
                    : nodes[0].name}
                </div>
                {results.data.sequence_data[nodes[0].idx].map((api_idx, i) => (
                  <div key={i} className="border-line">
                    {api_idx}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          ""
        )}
        {nodes.length === 2 && clicked === "node" ? (
          <div style={{ overflow: "scroll", height: "62%" }}>
            <div className="compare-box">
              <div className="" style={{ width: "100%" }}>
                <div>시퀀스</div>
                {results.data.sequence_data[nodes[0].idx].map((d, i) => (
                  <div className="border-line">{"t_" + i}</div>
                ))}
              </div>
              <div className="">
                <div>
                  {nodes[0].name.length >= 7
                    ? nodes[0].name.slice(0, 7) + "..."
                    : nodes[0].name}
                </div>
                {results.data.sequence_data[nodes[0].idx].map((api_idx, i) => (
                  <div key={i} className="border-line">
                    {api_idx}
                  </div>
                ))}
              </div>
              <div className="">
                <div>
                  {nodes[1].name.length >= 7
                    ? nodes[1].name.slice(0, 7) + "..."
                    : nodes[1].name}
                </div>
                {results.data.sequence_data[nodes[1].idx].map((api_idx, i) => (
                  <div key={i} className="border-line">
                    {api_idx}
                  </div>
                ))}
              </div>
            </div>
            <div>{`두 악성코드 간 유사도: ${
              1 - results.data.distance_matrix[nodes[0].idx][nodes[1].idx]
            }`}</div>
            <div
              className="similar-seq-box"
              style={{ overflow: "scroll", height: "30%" }}
            >
              <div>유사 시퀀스 목록</div>
              {results.data.similar_sequence_matrix[nodes[0].idx][
                nodes[1].idx
              ].map((sim_seq, i) => (
                <div key={i} className="border-line">
                  {sim_seq.replace(",", " ->")}
                </div>
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
