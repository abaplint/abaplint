export class FlowGraph {
  private edges: {[from: string]: {[to: string]: boolean}};
  private readonly start: string;
  private readonly end: string;

  public constructor(counter: number) {
    this.edges = {};
    this.start = "start#" + counter;
    this.end = "end#" + counter;
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
    return Array.from(set.values());
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
    return graph.trim();
  }

  public listSources(node: string): string[] {
    const set = new Set<string>();
    for (const l of this.listEdges()) {
      if (node === l.to) {
        set.add(l.from);
      }
    }
    return Array.from(set.values());
  }

  public listTargets(node: string): string[] {
    const set = new Set<string>();
    for (const l of this.listEdges()) {
      if (node === l.from) {
        set.add(l.to);
      }
    }
    return Array.from(set.values());
  }
}