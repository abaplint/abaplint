import {StatementNode} from "../../abap/nodes";
import {MethodDef} from "../../abap/statements";
import {MethodName} from "../../abap/expressions";
import {MethodParameters} from "./method_parameters";
import {Scope} from "./scope";
import {Position} from "../../position";

export class MethodDefinition {
  private scope: Scope;
  private name: string;
  private position: Position;
  private parameters: MethodParameters;

// todo:
// abstract
// final
// redefinition

  constructor(node: StatementNode, scope: Scope) {
    if (!(node.get() instanceof MethodDef)) {
      throw new Error("MethodDefinition, expected MethodDef as part of input node");
    }
    const found = node.findFirstExpression(MethodName);
    if (found === undefined) {
      throw new Error("MethodDefinition, expected MethodDef as part of input node");
    }
    this.name = found.getFirstToken().getStr();
    this.position = found.getFirstToken().getPos();
    this.scope = scope;
    this.parameters = new MethodParameters(node);
  }

  public getName(): string {
    return this.name;
  }

  public getPosition(): Position {
    return this.position;
  }

  public getScope() {
    return this.scope;
  }

  public getParameters() {
    return this.parameters;
  }

}