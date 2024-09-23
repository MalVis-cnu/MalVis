import * as d3 from "d3";
import { useEffect, useRef, memo } from "react";

import "./Main.css";

const MainForKmeans = memo(({ data, onSendDetail }) => {
  const ref = useRef(null);

  useEffect(() => {
    const width = ref.current.clientWidth;
    const height = ref.current.clientHeight;

    // 색 범위 지정
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    if (data) {
      console.log(data);
      const currentElement = ref.current;

      // zoom 기능 정의
      const zoomer = d3
        .zoom()
        .scaleExtent([0.5, 8]) // 축소, 확대 비율
        .translateExtent([
          // 드래그로 이동할 수 있는 범위
          [-width / 2, -height / 2],
          [width * 2, height * 2],
        ])
        .on("zoom", (event) => {
          node.attr("transform", event.transform);
          link.attr("transform", event.transform);
        });

      // 그래프 그릴 화면 설정
      const documentElement = d3
        .select(currentElement)
        .call((g) => g.select("svg").remove())
        .append("svg")
        .attr("viewBox", `0, 0, ${width}, ${height}`)
        .on("click", function (event) {
          if (event.target.tagName === 'svg') {
            d3.selectAll("line").attr("stroke", "#999");

            // 선택된 노드 복원
            d3.selectAll("circle")
              .nodes()
              .map((circle) => {
                d3.selectAll("." + circle.classList[0])
                  .attr("fill", circle.classList[0].replace("_", "#"))
                  .attr("r", 7);
              });
            onSendDetail({});
          }
        });
      // .attr("width", width)
      // .attr("height", height)
      // .attr("transform", "translate(40,0)");

      // zoom 기능 연결
      documentElement.call(zoomer);

      const links = data.links.map((d) => ({ ...d }));
      const nodes = data.nodes.map((d) => ({ ...d }));

      // Create a simulation with several forces.
      const simulation = d3
        .forceSimulation(nodes)
        .force(
          "link",
          d3
            .forceLink(links)
            .id((d) => d.id)
            .distance((d) => d.length * 100 + 100)
        )
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, height / 2))
        .on("tick", ticked);

      // Add a line for each link, and a circle for each node.
      const link = d3
        .select("svg")
        .append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll()
        .data(links)
        .join("line")
        .attr("stroke-width", 2)
        .on("click", function (event, info) {
          console.log(info);
          // 기존 라인 색상 복원
          d3.selectAll("line").attr("stroke", "#999");

          // 선택된 노드 복원
          d3.selectAll("circle")
            .nodes()
            .map((circle) => {
              d3.selectAll("." + circle.classList[0])
                .attr("fill", circle.classList[0].replace("_", "#"))
                .attr("r", 7);
            });
          d3.select(this).attr("stroke", "red");
        });

      const node = d3
        .select("svg")
        .append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll()
        .data(nodes)
        .join("circle")
        .attr("r", 7)
        .attr("fill", (d) => color(d.group))
        .attr("class", (d) => color(d.group).replace("#", "_"))
        .on("mouseover", function (event, info) {
          d3.select(this).style("cursor", "pointer");

          const viewBox = d3.select("svg").node().getBoundingClientRect();
          const group1 = d3.select("svg").append("g").attr("class", "group1");

          const name =
            info.name.length > 7 ? info.name.slice(0, 7) + "..." : info.name;

          const lineInterval = 20;
          const indentation = 8;
          const startingPoint = 10;

          group1
            .append("rect")
            .attr("x", event.clientX - viewBox.left + startingPoint)
            .attr("y", event.clientY - viewBox.top + startingPoint)
            .attr("width", 140)
            .attr("height", 60)
            .attr("fill", "#fad390")
            .attr("opacity", 0.5);
          group1
            .append("text")
            .attr(
              "x",
              event.clientX - viewBox.left + startingPoint + indentation
            )
            .attr(
              "y",
              event.clientY - viewBox.top + startingPoint + lineInterval
            )
            .text("hash : " + name);
          group1
            .append("text")
            .attr(
              "x",
              event.clientX - viewBox.left + startingPoint + indentation
            )
            .attr(
              "y",
              event.clientY - viewBox.top + startingPoint + lineInterval * 2
            )
            .text("group : " + info.group);
        })
        .on("mouseout", function () {
          d3.select(this).style("cursor", null);
          d3.select(".group1").remove();
        })
        .on("click", function (event, info) {
          const clicked = d3.selectAll("circle").filter(function () {
            return d3.select(this).attr("fill") === "red";
          })._groups[0];
          console.log(clicked);

          // 라인 색상 원래대로 복원
          d3.selectAll("line").attr("stroke", "#999");
          if (clicked.length >= 2) {
            clicked.map((circle) => {
              d3.selectAll("." + circle.classList[0])
                .attr("fill", circle.classList[0].replace("_", "#"))
                .attr("r", 7);
            });
          }
          d3.select(this).attr("fill", "red");
          d3.select(this).attr("r", 10);
          const name = nodes[info.index].name;
          const idx = nodes[info.index].idx;
          const group = nodes[info.index].group;
          onSendDetail({ idx, name, group });
        });

      // Add a drag behavior.
      node.call(
        d3
          .drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );

      // Set the position attributes of links and nodes each time the simulation ticks.
      function ticked() {
        link
          .attr("x1", (d) => d.source.x)
          .attr("y1", (d) => d.source.y)
          .attr("x2", (d) => d.target.x)
          .attr("y2", (d) => d.target.y);

        node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
      }

      // Reheat the simulation when drag starts, and fix the subject position.
      function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      // Update the subject (dragged node) position during drag.
      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      // Restore the target alpha so the simulation cools after dragging ends.
      // Unfix the subject position now that it’s no longer being dragged.
      function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
    }
  }, [data, ref, onSendDetail]);

  return <div className="main" ref={ref}></div>;
});

export default MainForKmeans;
