import {StatementNode} from "../../abap/nodes";
import {MethodDef} from "../../abap/statements";
import * as Expressions from "../../abap/expressions";
import {MethodParameters} from "./method_parameters";
import {Scope} from "./scope";
import {Identifier} from "./_identifier";

export class MethodDefinition extends Identifier {
  private scope: Scope;
  private parameters: MethodParameters;
  private redfinition: boolean;
  private eventHandler: boolean;

// todo:
// abstract
// final

  constructor(node: StatementNode, scope: Scope) {
    if (!(node.get() instanceof MethodDef)) {
      throw new Error("MethodDefinition, expected MethodDef as part of input node");
    }
    const found = node.findFirstExpression(Expressions.MethodName);
    if (found === undefined) {
      throw new Error("MethodDefinition, expected MethodDef as part of input node");
    }
    super(found.getFirstToken(), node);

    this.redfinition = false;
    if (node.findFirstExpression(Expressions.Redefinition)) {
      this.redfinition = true;
    }

    this.eventHandler = false;
    if (node.findFirstExpression(Expressions.EventHandler)) {
      this.eventHandler = true;
    }

    this.scope = scope;
    this.parameters = new MethodParameters(node);
  }

  public getScope() {
    return this.scope;
  }

  public isRedefinition(): boolean {
    return this.redfinition;
  }

  public isEventHandler(): boolean {
    return this.eventHandler;
  }

  public getParameters() {
    return this.parameters;
  }

}