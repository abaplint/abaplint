import {File} from "./file";
import {Token} from "./tokens/token";
import {BasicNode, StructureNode, ReuseNode, TokenNode} from "./node";

// all types determined for "source" and "target" AST nodes

export class Result {
  private types;
  private variables;
  private sources: Array<ReuseNode>;

  constructor(sources: Array<ReuseNode>) {
    this.sources = sources;
  }

  public getSourceCount() {
    return this.sources.length;
  }

  public lookup() {
// todo, input? output?
  }
}

export class Analyze {

  public static run(file: File): Result {
    let res = new Result(this.findSources(file.getRoot()));

    return res;
  }

  private static findSources(n: BasicNode): Array<ReuseNode> {
    let res: Array<ReuseNode> = [];

    if (n instanceof StructureNode) {
      res = res.concat(this.findSources((n as StructureNode).getStart().getRoot()));
    } else if (n instanceof ReuseNode && n.getName() == "source") {
      return [n as ReuseNode];
    }

    for (let child of n.getChildren()) {
      res = res.concat(this.findSources(child));
    }
    return res;
  }

  private static findFirstToken(n: BasicNode): Token {
    if (n instanceof TokenNode) {
      return (n as TokenNode).getToken();
    }

    for (let child of n.getChildren()) {
      return this.findFirstToken(child);
    }

    throw new Error("error, findFirstToken");
  }
}