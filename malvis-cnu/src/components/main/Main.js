import * as d3 from "d3";
import { useEffect, useRef, memo } from "react";

import "./Main.css";

const Main = memo(({ data, onSendDetail, onSendClusters }) => {
  const ref = useRef(null);

  useEffect(() => {
    // const width = ref.current.clientWidth;
    // const height = ref.current.clientHeight;
    const width = 1000;
    const height = 800;

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

      function getEdgeInfo(parent) {
        const left = parent.children[0];
        const right = parent.children[1];

        const left_cluster = [];
        const right_cluster = [];

        let stack = [left.data];
        while (stack.length !== 0) {
          const current = stack.pop();
          if (current.type === "leaf") {
            left_cluster.push(current.name);
          } else {
            stack.push(current.children[0]);
            stack.push(current.children[1]);
          }
        }
        stack = [right.data];
        while (stack.length !== 0) {
          const current = stack.pop();
          if (current.type === "leaf") {
            right_cluster.push(current.name);
          } else {
            stack.push(current.children[0]);
            stack.push(current.children[1]);
          }
        }

        return [left_cluster, right_cluster, parent];
      }

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
        .attr("stroke", "#5b9dff")
        .attr("stroke-width", 3)
        .on("mouseover", function () {
          // 마우스 오버 시 이벤트
          d3.selectAll(`.${this.classList[0]}`).attr("stroke", "#e1b12c");
        })
        .on("mouseout", function () {
          // 마우스를 치웠을 때 이벤트
          d3.selectAll(`.${this.classList[0]}`).attr("stroke", "#5b9dff");
        })
        .on("click", function (event, info) {
          // 클릭 시 이벤트
          d3.selectAll("text").attr("stroke", "black"); // 기존 노드 클릭 정보 제거
          documentElement.selectAll(".distance").remove(); // 기존 엣지 정보 표시 제거
          if (prevClass !== "") {
            // 클릭됐었던 엣지에 mouseout 이벤트 복구
            d3.selectAll(prevClass).on("mouseout", function () {
              d3.selectAll(`.${this.classList[0]}`).attr("stroke", "#5b9dff");
            });
          }
          prevClass = `.${this.classList[0]}`; // mouseout 이벤트 복구를 위해 현재 클릭한 엣지의 클래스 명 저장
          d3.selectAll(`.${this.classList[0]}`).on("mouseout", null); // mouseout 이벤트 제거
          d3.selectAll("path").attr("stroke", "#5b9dff");
          d3.selectAll(`.${this.classList[0]}`).attr("stroke", "#e1b12c");
          onSendClusters(getEdgeInfo(info.parent));
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
        .selectAll("text")
        .data(nodeList)
        .enter()
        .append("text")
        .attr("x", function (d) {
          return d.y + 10;
        })
        .attr("y", function (d) {
          return d.x;
        })
        // .attr("r", 8)
        // .style("fill", "#5b9dff")
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .text((d) => {
          return d.data.name.length >= 7
            ? d.data.name.slice(0, 7) + "..."
            : d.data.name;
        })
        .on("mouseover", function () {
          d3.select(this).style("cursor", "pointer");
        })
        .on("mouseout", function () {
          d3.select(this).style("cursor", null);
        })
        .on("click", function (event, info) {
          d3.selectAll("path").attr("stroke", "#5b9dff");
          const clicked = d3.selectAll("text").filter(function () {
            return d3.select(this).attr("stroke") === "red";
          })._groups[0].length;

          if (clicked >= 2) {
            d3.selectAll("text").attr("stroke", "black");
          }
          d3.select(this).attr("stroke", "red");
          const name = info.data.name;
          const idx = info.data.i;
          onSendDetail({ idx, name });
        });
    }
  }, [data, ref, onSendDetail, onSendClusters]);

  return <div className="main" ref={ref}></div>;
});

export default Main;
