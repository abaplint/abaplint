import {StatementNode} from "../../abap/nodes";
import {MethodDef} from "../../abap/statements";
import {MethodName} from "../../abap/expressions";
import {MethodParameters} from "./method_parameters";
import {Scope} from "./scope";
import {Identifier} from "./_identifier";

export class MethodDefinition extends Identifier {
  private scope: Scope;
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
    super(found.getFirstToken().getStr(), found.getFirstToken().getPos());

    this.scope = scope;
    this.parameters = new MethodParameters(node);
  }

  public getScope() {
    return this.scope;
  }

  public getParameters() {
    return this.parameters;
  }

}