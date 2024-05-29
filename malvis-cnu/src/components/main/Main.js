import * as d3 from "d3";
import { useEffect, useRef } from "react";

import "./Main.css";

const Main = ({ data }) => {
  const ref = useRef(null);

  useEffect(() => {
    const width = ref.current.clientWidth;
    const height = ref.current.clientHeight;

    let prevClass = ""; // edge - mouseout 이벤트 복구용 변수

    if (data) {
      const currentElement = ref.current;

      // zoom 기능 정의
      const zoomer = d3
        .zoom()
        .scaleExtent([0.8, 8]) // 축소, 확대 비율
        .translateExtent([
          // 드래그로 이동할 수 있는 범위
          [-500, -500],
          [width + 500, height + 500],
        ])
        .on("zoom", (event) => {
          nodes.attr("transform", event.transform);
          edges.attr("transform", event.transform);
        });

      // 그래프 그릴 화면 설정
      const documentElement = d3
        .select(currentElement)
        .call((g) => g.select("svg").remove())
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("transform", "translate(40,0)");

      // zoom 기능 연결
      documentElement.call(zoomer);

      // 덴드로그램을 위한  계층 구조 생성
      const clusterLayout = d3.cluster().size([height, width - 100]);

      const root = d3.hierarchy(data, function (d) {
        return d.children;
      });
      clusterLayout(root);

      root.descendants().forEach((node) => {
        node.y += node.data.value * 60;
      });

      // edge 그리기
      const edges = documentElement
        .selectAll("path")
        .data(root.descendants().slice(1))
        .enter()
        .append("path")
        .attr("d", function (d) {
          return (
            "M" +
            d.y +
            "," +
            d.x + // 시작점
            "H" +
            d.parent.y + // 수평선
            "V" +
            d.parent.x // 수직선
          );
        })
        .attr("class", function (d) {
          return `_${d.parent.data.name}`;
        })
        .style("fill", "none")
        .attr("stroke", "#ccc")
        .on("mouseover", function () {
          // 마우스 오버 시 이벤트
          d3.selectAll(`.${this.classList[0]}`).attr("stroke", "red");
        })
        .on("mouseout", function () {
          // 마우스를 치웠을 때 이벤트
          d3.selectAll(`.${this.classList[0]}`).attr("stroke", "#ccc");
        })
        .on("click", function (event, info) {
          // 클릭 시 이벤트
          documentElement.selectAll("text").remove(); // 기존 엣지 정보 표시 제거
          if (prevClass !== "") {
            // 클릭됐었던 엣지에 mouseout 이벤트 복구
            d3.selectAll(prevClass).on("mouseout", function () {
              d3.selectAll(`.${this.classList[0]}`).attr("stroke", "#ccc");
            });
          }
          prevClass = `.${this.classList[0]}`; // mouseout 이벤트 복구를 위해 현재 클릭한 엣지의 클래스 명 저장
          d3.selectAll(`.${this.classList[0]}`).on("mouseout", null); // mouseout 이벤트 제거
          d3.selectAll("path").attr("stroke", "#ccc");
          d3.selectAll(`.${this.classList[0]}`).attr("stroke", "red");
          documentElement // 정보 표시
            .append("text")
            .attr("id", "edge-" + info.data.name + info.data.value)
            .attr("x", 0)
            .attr("y", height / 2)
            .attr("stroke", "blue")
            .attr("stroke-width", 1)
            .text("distance: " + info.data.value);
        });

      // node 그리기
      // 그릴 노드 선택
      const nodeList = [];
      root.descendants().forEach((node) => {
        if (node.data.type === "leaf") {
          nodeList.push(node);
        }
      });

      // 노드 그리기
      const nodes = documentElement
        .selectAll("circle")
        .data(nodeList)
        .enter()
        .append("circle")
        .attr("cx", function (d) {
          return d.y;
        })
        .attr("cy", function (d) {
          return d.x;
        })
        .attr("r", 6)
        .style("fill", "#69b3a2")
        .attr("stroke", "black")
        .style("stroke-width", 2);
    }
  }, [data, ref]);

  return <div className="main" ref={ref}></div>;
};

export default Main;
