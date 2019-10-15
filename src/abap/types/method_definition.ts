import {StatementNode} from "../../abap/nodes";
import {MethodDef} from "../../abap/statements";
import * as Expressions from "../../abap/expressions";
import {MethodParameters} from "./method_parameters";
import {Visibility} from "./visibility";
import {Identifier} from "./_identifier";

export class MethodDefinition extends Identifier {
  private visibility: Visibility;
  private parameters: MethodParameters;
  private redefinition: boolean;
  private eventHandler: boolean;
  private abstract: boolean;

// todo:
// final

  constructor(node: StatementNode, visibility: Visibility) {
    if (!(node.get() instanceof MethodDef)) {
      throw new Error("MethodDefinition, expected MethodDef as part of input node");
    }
    const found = node.findFirstExpression(Expressions.MethodName);
    if (found === undefined) {
      throw new Error("MethodDefinition, expected MethodDef as part of input node");
    }
    super(found.getFirstToken());

    this.redefinition = false;
    if (node.findFirstExpression(Expressions.Redefinition)) {
      this.redefinition = true;
    }

    this.eventHandler = false;
    if (node.findFirstExpression(Expressions.EventHandler)) {
      this.eventHandler = true;
    }

    this.abstract = false;
    if (node.findFirstExpression(Expressions.Abstract)) {
      this.abstract = true;
    }

    this.visibility = visibility;
    this.parameters = new MethodParameters(node);
  }

  public getVisibility() {
    return this.visibility;
  }

  public isRedefinition(): boolean {
    return this.redefinition;
  }

  public isAbstract(): boolean {
    return this.abstract;
  }

  public isEventHandler(): boolean {
    return this.eventHandler;
  }

  public getParameters() {
    return this.parameters;
  }

}