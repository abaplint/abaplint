import {StatementNode} from "../nodes";
import {MethodDef} from "../2_statements/statements";
import * as Expressions from "../2_statements/expressions";
import {MethodParameters} from "./method_parameters";
import {Visibility} from "../4_file_information/visibility";
import {Identifier} from "../4_file_information/_identifier";
import {CurrentScope} from "../5_syntax/_current_scope";
import {IMethodDefinition} from "./_method_definition";
import {ReferenceType} from "../5_syntax/_reference";

export class MethodDefinition extends Identifier implements IMethodDefinition {
  private readonly visibility: Visibility;
  private readonly parameters: MethodParameters;
  private readonly redefinition: boolean;
  private readonly eventHandler: boolean;
  private readonly abstract: boolean;
  private readonly static: boolean;
  private readonly raising: string[];

// todo: final flag

  public constructor(node: StatementNode, visibility: Visibility, filename: string, scope: CurrentScope) {
    if (!(node.get() instanceof MethodDef)) {
      throw new Error("MethodDefinition, expected MethodDef as part of input node");
    }

    const found = node.findDirectExpression(Expressions.MethodName);
    if (found === undefined) {
      throw new Error("MethodDefinition, expected MethodDef as part of input node");
    }
    super(found.getFirstToken(), filename);

    this.redefinition = false;
    if (node.findDirectExpression(Expressions.Redefinition)) {
      this.redefinition = true;

      const name = found.getFirstToken().getStr();
      if (name.includes("~")) {
        const idef = scope.findInterfaceDefinition(name.split("~")[0]);
        if (idef) {
          scope.addReference(found.getFirstToken(), idef, ReferenceType.ObjectOrientedReference, filename);
        }
      }
    }

    this.eventHandler = false;
    if (node.findDirectExpression(Expressions.EventHandler)) {
      this.eventHandler = true;
    }

    this.abstract = false;
    if (node.findDirectExpression(Expressions.Abstract)) {
      this.abstract = true;
    }

    this.static = false;
    // checks for "CLASS-METHODS"
    if (node.getFirstToken().getStr().toUpperCase().startsWith("CLASS")) {
      this.static = true;
    }

    this.raising = [];
    for (const r of node.findDirectExpression(Expressions.MethodDefRaising)?.findAllExpressions(Expressions.ClassName) || []) {
      const token = r.getFirstToken();
      const name = token.getStr();
      this.raising.push(name);
      const clas = scope.findClassDefinition(name);
      if (clas) {
        scope.addReference(token, clas, ReferenceType.ObjectOrientedReference, filename);
      }
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

  public getRaising(): readonly string[] {
    return this.raising;
  }

}