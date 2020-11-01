/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
const Artifacts = require("../../packages/core/build/src/abap/artifacts").Artifacts;
const vizRenderStringSync = require("@aduh95/viz.js/sync");
const fs = require("fs");
const path = require("path");

class Graph {
  constructor(name) {
    this.nodes = [];
    this.edges = [];
    this.name = name;
  }

  addNode(name) {
    if (this.nodes.includes(name) === true) {
      return true;
    }
    this.nodes.push(name);
    return false;
  }

  addEdge(from, to) {
    this.edges.push({from, to});
  }

  output() {
    let ret = `digraph G {\n`;
    ret += `  label="${this.name}";\n  labelloc=top;\n  labeljust=left;\n`;
    for (const n of this.nodes) {
      let shape = "box";
      if (n.startsWith("structure/")) {
        shape = "ellipse";
      } else if (n.startsWith("statement")) {
        shape = "house";
      }
      ret += `  "${n}" [shape=${shape},URL="https://syntax.abaplint.org/#/${n}"];\n`;
    }
    for (const e of this.edges) {
      ret += `  "${e.from}" -> "${e.to}";\n`;
    }
    ret += `}`;
    return ret;
  }
}

class WhereUsed {

  static run() {
    this.using = this.init();

    for (const name of Object.keys(this.using)) {
      if (name.startsWith("statement/")) {
        continue;
      }
      console.log(name);
      const graph = new Graph("Where used, " + name);
      this.build(name, graph);
      const svg = vizRenderStringSync(graph.output());
      fs.writeFileSync("build" + path.sep + name.replace("/", "_") + "_WhereUsed.svg", svg);
    }
  }

  static build(name, graph) {
    if (graph.addNode(name)) {
      // already exists, do not recurse
      return;
    }
    for (const u of Object.keys(this.using)) {
      if (this.using[u].includes(name)) {
        graph.addEdge(u, name);
        this.build(u, graph);
      }
    }
  }

  static init() {
    const res = {};

    for (const expr of Artifacts.getExpressions()) {
      const e = new expr();
      res["expression/" + e.constructor.name] = e.getRunnable().getUsing();
    }

    for (const stat of Artifacts.getStatements()) {
      res["statement/" + stat.constructor.name] = stat.getMatcher().getUsing();
    }

    return res;
  }

}

WhereUsed.run();