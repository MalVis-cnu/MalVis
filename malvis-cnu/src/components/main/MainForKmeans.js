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
          [-500, -500],
          [width + 500, height + 500],
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
        .attr("width", width)
        .attr("height", height)
        .attr("transform", "translate(40,0)");

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
        .attr("stroke-width", 2);

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
        .on("click", function (event, info) {
          console.log(info);
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
