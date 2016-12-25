import {ParsedFile} from "./file";
import {Token} from "./tokens/token";
import * as Reuse from "./statements/reuse";
import {BasicNode, StructureNode, ReuseNode, TokenNode, StatementNode} from "./node";
import * as Statements from "./statements/";

// all types determined for "source" and "target" AST nodes

export class Result {
  private types: Array<StatementNode>;
  private variables: Array<StatementNode>;
  private sources: Array<ReuseNode>;

  constructor(types: Array<StatementNode>,
              variables: Array<StatementNode>,
              sources: Array<ReuseNode>) {
    this.types = types;
    this.variables = variables;
    this.sources = sources;
  }

  public getSourceCount() {
    return this.sources.length;
  }

  public getTypeCount() {
    return this.types.length;
  }

  public getVariableCount() {
    return this.variables.length;
  }

  public lookup() {
// todo, input? output?
  }
}

export class Analyze {

// todo, dont use magic constants use "instanceof" instead

  public static run(file: ParsedFile): Result {
// pass 1 = TYPEs and CLASS DEFINITIONS
    let types = this.findTypes(file.getRoot());
// todo, class definitions

// pass 2 = DATA and CLASS-DATA
    let variables = this.findData(file.getRoot());

// pass 3 = source and targets
    let sources = this.findSources(file.getRoot());
// todo, targets

    return new Result(types, variables, sources);
  }

  private static findData(n: BasicNode): Array<StatementNode> {
    return this.walk<StatementNode>(n, (b) => {
      if (b instanceof Statements.Data) {
        return [b as StatementNode];
      } else {
        return [];
      }
    });
  }

  private static findTypes(n: BasicNode): Array<StatementNode> {
    return this.walk<StatementNode>(n, (b) => {
      if (b instanceof Statements.Type) {
        return [b as StatementNode];
      } else {
        return [];
      }
    });
  }

  private static walk<T>(n: BasicNode, f: (n: BasicNode) => Array<T>): Array<T> {
    let res: Array<T> = [];

    if (n instanceof StructureNode) {
      res = res.concat(this.walk((n as StructureNode).getStart(), f));
    } else {
      let tmp = f(n);
      if (tmp.length > 0) {
        return tmp;
      }
    }

    for (let child of n.getChildren()) {
      res = res.concat(this.walk(child, f));
    }
    return res;
  }

  private static findSources(n: BasicNode): Array<ReuseNode> {
    return this.walk<ReuseNode>(n, (b) => {
      if (b instanceof ReuseNode && (b as ReuseNode).getReuse() instanceof Reuse.Source) {
        return [b as ReuseNode];
      } else {
        return [];
      }
    });
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