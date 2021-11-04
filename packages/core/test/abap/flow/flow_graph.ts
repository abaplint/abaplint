import {expect} from "chai";
import {FlowGraph} from "../../../src/abap/flow/flow_graph";

describe("FlowGraph", () => {

  it("test1", async () => {
    const graph = new FlowGraph();
    graph.addEdge("from", "to");
    expect(graph.listEdges()).to.deep.equal([{from: "from", to: "to"}]);
  });

});