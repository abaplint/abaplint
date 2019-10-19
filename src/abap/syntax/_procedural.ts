import * as Expressions from "../expressions";
import * as Statements from "../statements";
import * as Structures from "../structures";
import {StatementNode, ExpressionNode, StructureNode} from "../nodes";
import {Identifier} from "../types/_identifier";
import {ABAPObject} from "../../objects/_abap_object";
import {FormDefinition} from "../types";
import {Scope} from "./_scope";
import {FunctionGroup} from "../../objects";

// todo, rename this class?
class LocalIdentifier extends Identifier { }

export class Procedural {
  private readonly obj: ABAPObject;
  private readonly variables: Scope;

// todo: can "obj" as input be removed?
  constructor(obj: ABAPObject, variables: Scope) {
    this.obj = obj;
    this.variables = variables;
  }

  public addDefinitions(node: StatementNode, filename: string) {
    const sub = node.get();
    const ret: Identifier[] = [];

    if (sub instanceof Statements.Data
      || sub instanceof Statements.DataBegin
      || sub instanceof Statements.Constant
      || sub instanceof Statements.ConstantBegin
      || sub instanceof Statements.Static
      || sub instanceof Statements.StaticBegin) {
      ret.push(this.buildVariable(node.findFirstExpression(Expressions.NamespaceSimpleName), filename));
    } else if (sub instanceof Statements.Parameter) {
      ret.push(this.buildVariable(node.findFirstExpression(Expressions.FieldSub), filename));
    } else if (sub instanceof Statements.FieldSymbol) {
      ret.push(this.buildVariable(node.findFirstExpression(Expressions.FieldSymbol), filename));
    } else if (sub instanceof Statements.Tables || sub instanceof Statements.SelectOption) {
      ret.push(this.buildVariable(node.findFirstExpression(Expressions.Field), filename));
    }

    this.variables.addList(ret);
  }

  public addEnumValues(node: StructureNode, filename: string) {
    if (!(node.get() instanceof Structures.TypeEnum)) {
      throw new Error("addEnumValues unexpected type");
    }
    for (const type of node.findDirectStatements(Statements.Type)) {
      const expr = type.findFirstExpression(Expressions.NamespaceSimpleName);
      if (expr === undefined) {
        continue;
      }
      this.variables.addIdentifier(this.buildVariable(expr, filename));
    }
  }

  public findFunctionScope(node: StatementNode) {
    this.variables.pushScope("function");

    const name = node.findFirstExpression(Expressions.FunctionName)!.getFirstToken().getStr();
    const definition = (this.obj as FunctionGroup).getModule(name);
    if (definition === undefined) {
      throw new Error("Function group definition \"" + name + "\" not found");
    }

    for (const param of definition.getParameters()) {
      this.variables.addName(param);
    }
  }

  public findFormScope(node: StatementNode, filename: string) {
    this.variables.pushScope("form");
    this.variables.addList(new FormDefinition(node, filename).getParameters());
  }

  private buildVariable(expr: ExpressionNode | undefined, filename: string): Identifier {
    if (expr === undefined) { throw new Error("syntax_check, unexpected tree structure"); }
    // todo, these identifers should be possible to create from a Node
    // todo, how to determine the real types?
    const token = expr.getFirstToken();
    return new LocalIdentifier(token, filename);
  }

}