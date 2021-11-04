import {expect} from "chai";
import {FlowGraph} from "../../../src/abap/flow/flow_graph";

describe("FlowGraph", () => {

  it("test1", async () => {
    const graph = new FlowGraph(1);
    graph.addEdge("from", "to");
    expect(graph.listEdges()).to.deep.equal([{from: "from", to: "to"}]);
    expect(graph.listNodes()).to.deep.equal(["from", "to"]);

    expect(graph.listSources("from")).to.deep.equal([]);
    expect(graph.listTargets("from")).to.deep.equal(["to"]);

    expect(graph.listSources("to")).to.deep.equal(["from"]);
    expect(graph.listTargets("to")).to.deep.equal([]);

    graph.removeEdge("from", "to");
    expect(graph.listEdges()).to.deep.equal([]);
  });

});