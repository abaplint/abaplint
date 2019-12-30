import {IScopeIdentifier, IScopeVariable, IScopeData} from "./_current_scope";
import {Position} from "../../position";

export class SpaghettiScopeNode {
  private readonly identifier: IScopeIdentifier;
  private readonly children: SpaghettiScopeNode[];
  private readonly data: IScopeData;

  constructor(identifier: IScopeIdentifier) {
    this.identifier = identifier;
    this.children = [];
    this.data = {
      vars: [],
      cdefs: [],
      idefs: [],
      forms: [],
      types: [],
    };
  }

  public addChild(node: SpaghettiScopeNode) {
    this.children.push(node);
  }

  public getChildren(): SpaghettiScopeNode[] {
    return this.children;
  }

  public getVars(): IScopeVariable[] {
    return this.data.vars;
  }

  public getData(): IScopeData {
    return this.data;
  }

  public getIdentifier(): IScopeIdentifier {
    return this.identifier;
  }

  public calcCoverage(): {start: Position, end: Position} {
    let end: Position | undefined;

    // assumption: children start positions in ascending order
    for (const c of this.getChildren()) {
      if (c.getIdentifier().filename === this.identifier.filename) {
        end = c.getIdentifier().start;
        break;
      }
    }

    if (end === undefined) {
      end = new Position(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
    }

    return {start: this.identifier.start, end};
  }
}

export class SpaghettiScope {
  private readonly node: SpaghettiScopeNode;

  constructor(node: SpaghettiScopeNode) {
    this.node = node;
  }

  // list variable definitions in all nodes
  public listVars(filename: string): IScopeVariable[] {
    const ret: IScopeVariable[] = [];
    let stack: SpaghettiScopeNode[] = [this.node];

    while (stack.length > 0) {
      const current = stack.pop()!;
      if (current.getIdentifier().filename === filename) {
        for (const v of current.getVars()) {
          if (v.identifier.getFilename() === filename) {
            ret.push(v);
          }
        }
      }
      stack = stack.concat(current.getChildren());
    }

    return ret;
  }

  // most specific scope first, example sequence: [form, program, globals, builtin]
  public lookupPosition(p: Position, filename: string): SpaghettiScopeNode[] {
    return this.lookupPositionTraverse(p, filename, this.node);
  }

  private lookupPositionTraverse(p: Position, filename: string, node: SpaghettiScopeNode): SpaghettiScopeNode[] {
    if (node.getIdentifier().filename === filename) {
      const coverage = node.calcCoverage();
      if (p.isBetween(coverage.start, coverage.end)) {
        return [node];
      }
    }

    for (const c of node.getChildren()) {
      const result = this.lookupPositionTraverse(p, filename, c);
      if (result.length > 0) {
        result.push(node);
        return result;
      }
    }

    return [];
  }

  public getTop(): SpaghettiScopeNode {
    return this.node;
  }
}