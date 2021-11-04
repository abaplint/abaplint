export class FlowGraph {
  private static counter = 1;
  private edges: {[from: string]: {[to: string]: boolean}};
  private readonly start: string;
  private readonly end: string;

  public constructor() {
    this.edges = {};
    this.start = "start#" + FlowGraph.counter;
    this.end = "end#" + FlowGraph.counter;
    FlowGraph.counter++;
  }

  public getStart(): string {
    return this.start;
  }

  public getEnd(): string {
    return this.end;
  }

  public addEdge(from: string, to: string) {
    if (this.edges[from] === undefined) {
      this.edges[from] = {};
    }
    this.edges[from][to] = true;
  }

  public listEdges() {
    const list: {from: string, to: string}[] = [];
    for (const from of Object.keys(this.edges)) {
      for (const to of Object.keys(this.edges[from])) {
        list.push({from, to});
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
    return set;
  }

  public hasEdges(): boolean {
    return Object.keys(this.edges).length > 0;
  }

  /** return value: end node of to graph */
  public addGraph(from: string, to: FlowGraph): string {
    if (to.hasEdges() === false) {
      return from;
    }
    this.addEdge(from, to.getStart());
    to.listEdges().forEach(e => this.addEdge(e.from, e.to));
    return to.getEnd();
  }

  public toJSON(): string {
    return JSON.stringify(this.edges);
  }

  public toDigraph(): string {
    let graph = "";
    for (const l of this.listEdges()) {
      graph += `"${l.from}" -> "${l.to}";\n`;
    }
    return graph;
  }
}