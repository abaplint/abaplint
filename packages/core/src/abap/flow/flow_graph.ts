export enum FLOW_EDGE_TYPE {
  true = "true",
  false = "false",
  undefined = "undefined",
}

export class FlowGraph {
  private edges: {[from: string]: {[to: string]: FLOW_EDGE_TYPE}};
  private readonly startNode: string;
  private readonly endNode: string;
  private label: string;

  public constructor(counter: number) {
    this.edges = {};
    this.label = "undefined";
    this.startNode = "start#" + counter;
    this.endNode = "end#" + counter;
  }

  public getStart(): string {
    return this.startNode;
  }

  public getLabel(): string {
    return this.label;
  }

  public getEnd(): string {
    return this.endNode;
  }

  public addEdge(from: string, to: string, type: FLOW_EDGE_TYPE) {
    if (this.edges[from] === undefined) {
      this.edges[from] = {};
    }
    this.edges[from][to] = type;
  }

  public removeEdge(from: string, to: string) {
    if (this.edges[from] === undefined) {
      return;
    }
    delete this.edges[from][to];
    if (Object.keys(this.edges[from]).length === 0) {
      delete this.edges[from];
    }
  }

  public listEdges() {
    const list: {from: string, to: string, type: FLOW_EDGE_TYPE}[] = [];
    for (const from of Object.keys(this.edges)) {
      for (const to of Object.keys(this.edges[from])) {
        list.push({from, to, type: this.edges[from][to]});
      }
    }
    return list;
  }

  public listNodes() {
    const set = new Set<string>();
    for (const l of this.listEdges()) {
      set.add(l.from);
      set.add(l.to);
    }
    return Array.from(set.values());
  }

  private hasEdges(): boolean {
    return Object.keys(this.edges).length > 0;
  }

  /** return value: end node of to graph */
  public addGraph(from: string, to: FlowGraph, type: FLOW_EDGE_TYPE): string {
    if (to.hasEdges() === false) {
      return from;
    }
    this.addEdge(from, to.getStart(), type);
    to.listEdges().forEach(e => this.addEdge(e.from, e.to, e.type));
    return to.getEnd();
  }

  public toJSON(): string {
    return JSON.stringify(this.edges);
  }

  public toTextEdges(): string {
    let graph = "";
    for (const l of this.listEdges()) {
      const label = l.type === FLOW_EDGE_TYPE.undefined ? "" : ` [label="${l.type}"]`;
      graph += `"${l.from}" -> "${l.to}"${label};\n`;
    }
    return graph.trim();
  }

  public setLabel(label: string) {
    this.label = label;
  }

  public toDigraph(): string {
    return `digraph G {
labelloc="t";
label="${this.label}";
graph [fontname = "helvetica"];
node [fontname = "helvetica", shape="box"];
edge [fontname = "helvetica"];
${this.toTextEdges()}
}`;
  }

  public listSources(node: string): {name: string, type: FLOW_EDGE_TYPE}[] {
    const set: {name: string, type: FLOW_EDGE_TYPE}[] = [];
    for (const l of this.listEdges()) {
      if (node === l.to) {
        set.push({name: l.from, type: l.type});
      }
    }
    return set;
  }

  public listTargets(node: string): {name: string, type: FLOW_EDGE_TYPE}[] {
    const set: {name: string, type: FLOW_EDGE_TYPE}[] = [];
    for (const l of this.listEdges()) {
      if (node === l.from) {
        set.push({name: l.to, type: l.type});
      }
    }
    return set;
  }

  /** removes all nodes containing "#" that have one in-going and one out-going edge */
  public reduce() {
    for (const node of this.listNodes()) {
      if (node.includes("#") === false) {
        continue;
      }
      const sources = this.listSources(node);
      const targets = this.listTargets(node);
      if (sources.length > 0 && targets.length > 0) {
        // hash node in the middle of the graph
        for (const s of sources) {
          this.removeEdge(s.name, node);
        }
        for (const t of targets) {
          this.removeEdge(node, t.name);
        }
        for (const s of sources) {
          for (const t of targets) {
            let type = FLOW_EDGE_TYPE.undefined;
            if (s.type !== FLOW_EDGE_TYPE.undefined) {
              type = s.type;
            }
            if (t.type !== FLOW_EDGE_TYPE.undefined) {
              if (type !== FLOW_EDGE_TYPE.undefined) {
                throw new Error("reduce: cannot merge, different edge types");
              }
              type = t.type;
            }
            this.addEdge(s.name, t.name, type);
          }
        }
      }

      if (node.startsWith("end#") && sources.length === 0) {
        for (const t of targets) {
          this.removeEdge(node, t.name);
        }
      }
    }

    return this;
  }
}