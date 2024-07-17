import {StatementNode} from "../nodes";
import {MethodDef} from "../2_statements/statements";
import * as Expressions from "../2_statements/expressions";
import {MethodParameters} from "./method_parameters";
import {Visibility} from "../4_file_information/visibility";
import {Identifier} from "../4_file_information/_identifier";
import {IMethodDefinition} from "./_method_definition";
import {ReferenceType} from "../5_syntax/_reference";
import {SyntaxInput} from "../5_syntax/_syntax_input";

export class MethodDefinition extends Identifier implements IMethodDefinition {
  private readonly visibility: Visibility;
  private readonly parameters: MethodParameters;
  private readonly redefinition: boolean;
  private readonly eventHandler: boolean;
  private readonly abstract: boolean;
  private readonly static: boolean;
  private readonly raising: string[];
  private readonly exceptions: string[];

// todo: final flag

  public constructor(node: StatementNode, visibility: Visibility, input: SyntaxInput) {
    if (!(node.get() instanceof MethodDef)) {
      throw new Error("MethodDefinition, expected MethodDef as part of input node");
    }

    const found = node.findDirectExpression(Expressions.MethodName);
    if (found === undefined) {
      throw new Error("MethodDefinition, expected MethodDef as part of input node");
    }
    super(found.getFirstToken(), input.filename);

    this.redefinition = false;
    if (node.findDirectExpression(Expressions.Redefinition)) {
      this.redefinition = true;

      const name = found.getFirstToken().getStr();
      if (name.includes("~")) {
        const idef = input.scope.findInterfaceDefinition(name.split("~")[0]);
        if (idef) {
          input.scope.addReference(found.getFirstToken(), idef, ReferenceType.ObjectOrientedReference, input.filename);
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
      const clas = input.scope.findClassDefinition(name);
      if (clas) {
        input.scope.addReference(token, clas, ReferenceType.ObjectOrientedReference, input.filename, {ooName: name.toUpperCase(), ooType: "CLAS"});
      } else if (input.scope.getDDIC().inErrorNamespace(name) === false) {
        input.scope.addReference(token, clas, ReferenceType.ObjectOrientedVoidReference, input.filename, {ooName: name.toUpperCase(), ooType: "CLAS"});
      } else {
        input.scope.addReference(token, clas, ReferenceType.ObjectOrientedUnknownReference, input.filename, {ooName: name.toUpperCase(), ooType: "CLAS"});
      }
    }

    this.exceptions = [];
    for (const r of node.findDirectExpression(Expressions.MethodDefExceptions)?.findAllExpressions(Expressions.NamespaceSimpleName) || []) {
      const token = r.getFirstToken();
      const name = token.getStr();
      this.exceptions.push(name);
    }

    this.visibility = visibility;
    this.parameters = new MethodParameters(node, input, this.abstract);
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

  public getExceptions(): readonly string[] {
    return this.exceptions;
  }

}