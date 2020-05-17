import {StatementNode} from "../../abap/nodes";
import {MethodDef} from "../2_statements/statements";
import * as Expressions from "../2_statements/expressions";
import {MethodParameters} from "./method_parameters";
import {Visibility} from "../4_object_information/visibility";
import {Identifier} from "../4_object_information/_identifier";
import {CurrentScope} from "../5_syntax/_current_scope";
import {IMethodDefinition} from "./_method_definition";

export class MethodDefinition extends Identifier implements IMethodDefinition {
  private readonly visibility: Visibility;
  private readonly parameters: MethodParameters;
  private readonly redefinition: boolean;
  private readonly eventHandler: boolean;
  private readonly abstract: boolean;
  private readonly static: boolean;

// todo: final

  public constructor(node: StatementNode, visibility: Visibility, filename: string, scope: CurrentScope) {
    if (!(node.get() instanceof MethodDef)) {
      throw new Error("MethodDefinition, expected MethodDef as part of input node");
    }
    const found = node.findFirstExpression(Expressions.MethodName);
    if (found === undefined) {
      throw new Error("MethodDefinition, expected MethodDef as part of input node");
    }
    super(found.getFirstToken(), filename);

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

    this.static = false;
    if (node.getFirstToken().getStr().toUpperCase().startsWith("CLASS")) {
      this.static = true;
    }

    this.visibility = visibility;
    this.parameters = new MethodParameters(node, this.filename, scope);
  }

  public getVisibility(): Visibility {
    return this.visibility;
  }

  public isRedefinition(): boolean {
    return this.redefinition;
  }

  public isAbstract(): boolean {
    return this.abstract;
  }

  public isStatic(): boolean {
    return this.static;
  }

  public isEventHandler(): boolean {
    return this.eventHandler;
  }

  public getParameters(): MethodParameters {
    return this.parameters;
  }

}