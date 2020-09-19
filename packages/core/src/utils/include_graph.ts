import {Include} from "../abap/2_statements/statements";
import {IncludeName} from "../abap/2_statements/expressions";
import {FunctionGroup, Program} from "../objects";
import {CheckInclude} from "../rules/check_include";
import {Position} from "../position";
import {Issue} from "../issue";
import {IFile} from "../files/_ifile";
import {IIncludeGraph} from "./_include_graph";
import {IRegistry} from "../_iregistry";
import {ABAPObject} from "../objects/_abap_object";
import {Severity} from "../severity";

// todo, check for cycles/circular dependencies, method findTop
// todo, add configurable error for multiple use includes

function getABAPObjects(reg: IRegistry): ABAPObject[] {
  const ret: ABAPObject[] = [];
  for (const o of reg.getObjects()) {
    if (o instanceof ABAPObject) {
      ret.push(o);
    }
  }
  return ret;
}

interface IVertex {
  filename: string;
  includeName: string;
  include: boolean;
}

class Graph {
  public readonly vertices: IVertex[];
  public readonly edges: {from: string, to: string}[];

  public constructor() {
    this.vertices = [];
    this.edges = [];
  }

  public addVertex(vertex: IVertex) {
    this.vertices.push(vertex);
  }

  public findInclude(includeName: string): IVertex | undefined {
    for (const v of this.vertices) {
      if (v.includeName.toUpperCase() === includeName.toUpperCase()) {
        return v;
      }
    }
    return undefined;
  }

  public findVertex(filename: string): IVertex | undefined {
    for (const v of this.vertices) {
      if (v.filename.toUpperCase() === filename.toUpperCase()) {
        return v;
      }
    }
    return undefined;
  }

  public addEdge(from: IVertex, toFilename: string) {
    this.edges.push({from: from.filename, to: toFilename});
  }

  public findTop(filename: string): IVertex[] {
    let ret: IVertex[] = [];
    for (const e of this.edges) {
      if (e.from === filename) {
        ret = ret.concat(this.findTop(e.to));
      }
    }
    if (ret.length === 0) {
      const found = this.findVertex(filename);
      if (found !== undefined) {
        ret.push(found);
      }
    }
    return ret;
  }

}

export class IncludeGraph implements IIncludeGraph {
  private readonly reg: IRegistry;
  private readonly issues: Issue[];
  private readonly graph: Graph;

  public constructor(reg: IRegistry) {
    this.reg = reg;
    this.issues = [];
    this.graph = new Graph();
    this.build();
  }

  public getIssues(): Issue[] {
    return this.issues;
  }

  public listMainForInclude(filename: string): string[] {
    const ret: string[] = [];
    for (const f of this.graph.findTop(filename)) {
      if (f.include === false) {
        ret.push(f.filename);
      }
    }
    return ret;
  }

  public getIssuesFile(file: IFile): Issue[] {
    const ret: Issue[] = [];
    for (const i of this.issues) {
      if (i.getFilename() === file.getFilename()) {
        ret.push(i);
      }
    }
    return ret;
  }

///////////////////////////////

  private build() {
    this.addVertices();

    for (const o of getABAPObjects(this.reg)) {
      for (const f of o.getABAPFiles()) {
        for (const s of f.getStatements()) {
          if (s.get() instanceof Include) {
            const ifFound = s.concatTokens().toUpperCase().includes("IF FOUND");
            const iexp = s.findFirstExpression(IncludeName);
            if (iexp === undefined) {
              throw new Error("unexpected Include node");
            }
            const name = iexp.getFirstToken().getStr().toUpperCase();
            if (name.match(/^(\/\w+\/)?L.+XX$/)) { // function module XX includes, possibily namespaced
              continue;
            }
            const found = this.graph.findInclude(name);
            if (found === undefined) {
              if (ifFound === false) {
                const issue = Issue.atStatement(f, s, "Include " + name + " not found", new CheckInclude().getMetadata().key, Severity.Error);
                this.issues.push(issue);
              }
            } else if (found.include === false) {
              const issue = Issue.atStatement(f, s, "Not possible to INCLUDE a main program", new CheckInclude().getMetadata().key, Severity.Error);
              this.issues.push(issue);
            } else {
              this.graph.addEdge(found, f.getFilename());
            }
          }
        }
      }
    }

    this.findUnusedIncludes();
  }

  private findUnusedIncludes() {
    for (const v of this.graph.vertices) {
      if (v.include === true) {
        if (this.listMainForInclude(v.filename).length === 0) {
          const f = this.reg.getFileByName(v.filename);
          if (f === undefined) {
            throw new Error("findUnusedIncludes internal error");
          }
          const issue = Issue.atPosition(f, new Position(1, 1), "INCLUDE not used anywhere", new CheckInclude().getMetadata().key, Severity.Error);
          this.issues.push(issue);
        }
      }
    }
  }

  private addVertices() {
    for (const o of getABAPObjects(this.reg)) {

      if (o instanceof Program) {
        const file = o.getMainABAPFile();
        if (file) {
          this.graph.addVertex({
            filename: file.getFilename(),
            includeName: o.getName(),
            include: o.isInclude()});
        }
      } else if (o instanceof FunctionGroup) {
        for (const i of o.getIncludeFiles()) {
          this.graph.addVertex({
            filename: i.file.getFilename(),
            includeName: i.name,
            include: true});
        }
        const file = o.getMainABAPFile();
        if (file) {
          this.graph.addVertex({
            filename: file.getFilename(),
            includeName: o.getName(),
            include: false});
        }
      }
    }
  }

}