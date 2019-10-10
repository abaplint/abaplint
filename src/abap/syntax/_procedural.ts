import * as Expressions from "../expressions";
import * as Statements from "../statements";
import * as Structures from "../structures";
import {StatementNode, ExpressionNode, StructureNode} from "../nodes";
import {Identifier} from "../types/_identifier";
import {ABAPObject} from "../../objects/_abap_object";
import {Registry} from "../../registry";
import {FormDefinition} from "../types";
import {ScopedVariables} from "./_scoped_variables";
import {FunctionGroup} from "../../objects";

// todo, rename this class?
class LocalIdentifier extends Identifier { }

export class Procedural {
  private obj: ABAPObject;
  private variables: ScopedVariables;

  constructor(obj: ABAPObject, _reg: Registry, variables: ScopedVariables) {
    this.obj = obj;
    this.variables = variables;
  }

  public findDefinitions(node: StatementNode) {
    const sub = node.get();
    const ret: Identifier[] = [];

    if (sub instanceof Statements.Data
      || sub instanceof Statements.DataBegin
      || sub instanceof Statements.Constant
      || sub instanceof Statements.ConstantBegin
      || sub instanceof Statements.Static
      || sub instanceof Statements.StaticBegin) {
      ret.push(this.buildVariable(node.findFirstExpression(Expressions.NamespaceSimpleName)));
    } else if (sub instanceof Statements.Parameter) {
      ret.push(this.buildVariable(node.findFirstExpression(Expressions.FieldSub)));
    } else if (sub instanceof Statements.Tables || sub instanceof Statements.SelectOption) {
      ret.push(this.buildVariable(node.findFirstExpression(Expressions.Field)));
    }

    this.variables.addList(ret);
  }

  public addEnumValues(node: StructureNode) {
    if (!(node.get() instanceof Structures.TypeEnum)) {
      throw new Error("addEnumValues unexpected type");
    }
    for (const type of node.findDirectStatements(Statements.Type)) {
      const expr = type.findFirstExpression(Expressions.NamespaceSimpleName);
      if (expr === undefined) {
        continue;
      }
      this.variables.addIdentifier(this.buildVariable(expr));
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

  public findFormScope(node: StatementNode) {
    this.variables.pushScope("form");
    const formName = node.findFirstExpression(Expressions.FormName)!.getFirstToken().getStr();
    const form = this.findDefinition(formName);
    if (form === undefined) {
      throw new Error("Form definition \"" + formName + "\" not found");
    }
    this.variables.addList(form.getParameters());
  }

  private findDefinition(name: string): FormDefinition {
    for (const file of this.obj.getABAPFiles()) {
      const found = file.getFormDefinition(name);
      if (found) {
        return found;
      }
    }
    throw new Error("FORM defintion for \"" + name + "\" not found");
  }

  private buildVariable(expr: ExpressionNode | undefined): Identifier {
    if (expr === undefined) { throw new Error("syntax_check, unexpected tree structure"); }
    // todo, these identifers should be possible to create from a Node
    // todo, how to determine the real types?
    const token = expr.getFirstToken();
    return new LocalIdentifier(token);
  }

}