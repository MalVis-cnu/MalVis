import * as d3 from "d3";
import { useEffect, useRef, memo } from "react";

import "./Main.css";

const Main = memo(({ data, result, onSendDetail, onSendClusters }) => {
  const ref = useRef(null);

  useEffect(() => {
    const width = ref.current.clientWidth;
    const height = ref.current.clientHeight;
    // const width = 1000;
    // const height = 800;

    let prevClass = ""; // edge - mouseout 이벤트 복구용 변수

    if (data) {
      const currentElement = ref.current;

      // zoom 기능 정의
      const zoomer = d3
        .zoom()
        .scaleExtent([0.8, 8]) // 축소, 확대 비율
        .translateExtent([
          // 드래그로 이동할 수 있는 범위
          [-width / 2, -height / 2],
          [width * 2, height * 2],
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
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("transform", "translate(40,0)")
        .on("click", function () {
          if (this.tagName === "svg") {
            d3.selectAll("text").attr("stroke", "black");
            prevClass = "";
            initDendrogramColor(d3, result, prevClass);
            onSendDetail({});
            onSendClusters(null);
          }
        });

      // zoom 기능 연결
      documentElement.call(zoomer);

      // 덴드로그램을 위한  계층 구조 생성
      const clusterLayout = d3.cluster().size([height, width - 100]);

      const root = d3.hierarchy(data, function (d) {
        return d.children;
      });
      clusterLayout(root);

      // leaf node의 y값 찾기
      let yleaf = 0;
      const ratio = 0.01;
      root.descendants().forEach((node) => {
        if (node.data.type === "leaf") {
          yleaf = node.y;
        }
      });

      // 찾아낸 y값으로 각 계층의 높이 계산
      root.descendants().forEach((node) => {
        node.y = yleaf - yleaf * node.data.value - yleaf * ratio * node.height;
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
        .attr("stroke", "#5b9dff")
        .attr("stroke-width", 3)
        .on("mouseover", function () {
          // 마우스 오버 시 이벤트
          d3.select(this).style("cursor", "pointer");
          const pathList = d3.selectAll(`.${this.classList[0]}`)._groups[0];
          d3.select(pathList[0]).attr(
            "beforeStroke",
            d3.select(pathList[0]).attr("stroke")
          );
          d3.select(pathList[1]).attr(
            "beforeStroke",
            d3.select(pathList[1]).attr("stroke")
          );
          d3.selectAll(`.${this.classList[0]}`).attr("stroke", "#e1b12c");
        })
        .on("mouseout", function () {
          // 마우스를 치웠을 때 이벤트
          d3.select(this).style("cursor", null);

          const pathList = d3.selectAll(`.${this.classList[0]}`)._groups[0];
          d3.select(pathList[0]).attr(
            "stroke",
            d3.select(pathList[0]).attr("beforeStroke")
          );
          d3.select(pathList[1]).attr(
            "stroke",
            d3.select(pathList[1]).attr("beforeStroke")
          );
          d3.selectAll(`.${this.classList[0]}`).attr("beforeStroke", null);
        })
        .on("click", function (event, info) {
          // 클릭 시 이벤트
          event.stopPropagation();
          d3.selectAll("text").attr("stroke", "black"); // 기존 노드 클릭 정보 제거

          prevClass = this;
          initDendrogramColor(d3, result, prevClass);
          d3.selectAll(`.${this.classList[0]}`)
            .attr("stroke", "#e1b12c")
            .attr("stroke-width", 5)
            .attr("beforeStroke", "#e1b12c");
          const edgeInfo = getEdgeInfo(info.parent);
          setLRClusterColor(d3, edgeInfo);
          onSendClusters(edgeInfo);
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
          event.stopPropagation();
          // d3.selectAll("path").attr("stroke", "#5b9dff");
          prevClass = "";
          initDendrogramColor(d3, result, prevClass);
          let clickedList = d3.selectAll("text").filter(function () {
            return d3.select(this).attr("stroke") === "red";
          })._groups[0];
          let clicked = clickedList.length;
          let name = info.data.name;
          let idx = info.data.i;

          if (clicked === 0) {
            d3.selectAll("text").attr("stroke", "black");
            d3.select(this).attr("stroke", "red");

            onSendDetail({ idx, name });
          } else if (clicked === 1) {
            if (clickedList[0] === this) {
              d3.select(this).attr("stroke", "black");
              onSendDetail({});
            } else {
              d3.select(this).attr("stroke", "red");
              onSendDetail({ idx, name });
              setRouteColor(d3, clickedList[0].__data__, this.__data__);
            }
          } else if (clicked >= 2) {
            if (clickedList.includes(this)) {
              d3.select(this).attr("stroke", "black");
              onSendDetail({});
              clickedList = d3.selectAll("text").filter(function () {
                return d3.select(this).attr("stroke") === "red";
              })._groups[0];
              name = clickedList[0].__data__.data.name;
              idx = clickedList[0].__data__.data.i;
              onSendDetail({ idx, name });
            } else {
              d3.selectAll("text").attr("stroke", "black");
              d3.select(this).attr("stroke", "red");
              onSendDetail({ idx, name });
            }
          }
        });
      initDendrogramColor(d3, result, prevClass);
    }
  }, [data, ref, onSendDetail, onSendClusters]);

  return <div className="main" ref={ref}></div>;
});

export default Main;

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

function initDendrogramColor(d3, result, selectedPath) {
  const n_cluster = result.data.option.clustering_option.n_cluster;
  const clusters = result.data.clusters;
  const pathList = d3.selectAll("path")._groups[0];
  const pathClusterList = Array.from({ length: n_cluster }, (v, i) => []);

  for (let path of pathList) {
    let data = path.__data__;
    let firstChildren;
    while (1) {
      if (data.data.type === "leaf") {
        firstChildren = data.data.i;
        break;
      }
      data = data.children[0];
    }

    for (let cluster in clusters) {
      if (clusters[cluster].includes(firstChildren)) {
        pathClusterList[cluster].push(path);
        break;
      }
    }
  }

  const color = d3.scaleOrdinal(d3.schemeCategory10);
  for (let i in pathClusterList) {
    const paths = pathClusterList[i];
    for (let path of paths) {
      if (
        selectedPath &&
        path.className.baseVal === selectedPath.className.baseVal
      )
        continue;
      else d3.select(path).attr("stroke", color(i)).attr("stroke-width", 3);
    }
  }
}

function setLRClusterColor(d3, edgeInfo) {
  const left_cluster = edgeInfo[0];
  const right_cluster = edgeInfo[1];

  const texts = d3.selectAll("text")._groups[0];

  for (let text of texts) {
    if (left_cluster.includes(text.__data__.data.name))
      d3.select(text).attr("stroke", "#fc0101");
    else if (right_cluster.includes(text.__data__.data.name))
      d3.select(text).attr("stroke", "blue");
  }
}

function setRouteColor(d3, node1, node2) {
  const node1ToRoot = [];
  const node2ToRoot = [];
  let parent = node1;

  while (parent) {
    node1ToRoot.push(parent);
    parent = parent.parent;
  }

  parent = node2;
  while (parent) {
    node2ToRoot.push(parent);
    parent = parent.parent;
  }

  const rootToNode1 = node1ToRoot.reverse();
  const rootToNode2 = node2ToRoot.reverse();

  let idx = 0;
  while (1) {
    if (rootToNode1[idx] !== rootToNode2[idx]) break;
    idx++;
  }
  idx--;
  const coloredRoute = [];
  for (let i = idx; i < rootToNode1.length - 1; i++) {
    let parent_data = rootToNode1[i].data.type + rootToNode1[i].data.name;
    let my_data = rootToNode1[i + 1].data.type + rootToNode1[i + 1].data.name;
    coloredRoute.push(parent_data + my_data);
  }
  for (let i = idx; i < rootToNode2.length - 1; i++) {
    let parent_data = rootToNode2[i].data.type + rootToNode2[i].data.name;
    let my_data = rootToNode2[i + 1].data.type + rootToNode2[i + 1].data.name;
    coloredRoute.push(parent_data + my_data);
  }

  const paths = d3.selectAll("path")._groups[0];
  for (let path of paths) {
    const path_data =
      path.__data__.parent.data.type +
      path.__data__.parent.data.name +
      path.__data__.data.type +
      path.__data__.data.name;

    if (coloredRoute.includes(path_data)) {
      d3.select(path).attr("stroke", "red").attr("stroke-width", 5);
    }
  }
}
