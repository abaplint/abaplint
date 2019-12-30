import {IScopeIdentifier, IScopeVariable} from "./_current_scope";
import {Position} from "../../position";

export class SpaghettiScopeNode {
  private readonly identifier: IScopeIdentifier;
  private readonly children: SpaghettiScopeNode[];
  private readonly vars: IScopeVariable[];

  constructor(identifier: IScopeIdentifier, vars: IScopeVariable[]) {
    this.identifier = identifier;
    this.children = [];
    this.vars = vars;
  }

  public addChild(node: SpaghettiScopeNode) {
    this.children.push(node);
  }

  public getChildren(): SpaghettiScopeNode[] {
    return this.children;
  }

  public getVars(): IScopeVariable[] {
    return this.vars;
  }

  public getIdentifier(): IScopeIdentifier {
    return this.identifier;
  }
}

export class SpaghettiScope {
  private readonly node: SpaghettiScopeNode;

  constructor(node: SpaghettiScopeNode) {
    this.node = node;
  }

  public lookupPosition(p: Position, filename: string) {
// todo
    return p.getCol() + filename;
  }

  public getTop(): SpaghettiScopeNode {
    return this.node;
  }
}