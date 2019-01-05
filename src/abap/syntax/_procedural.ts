import * as Expressions from "../expressions";
import * as Statements from "../statements";
import {StatementNode, ExpressionNode} from "../nodes";
import {TypedIdentifier} from "../types/_typed_identifier";
import {ABAPObject} from "../../objects/_abap_object";
import {Registry} from "../../registry";
import {FormDefinition} from "../types";
import {Variables} from "./_variables";
import {FunctionGroup} from "../../objects";
import {MemoryFile} from "../../files";
import {Globals} from "./_globals";

// todo, rename this class?
class LocalIdentifier extends TypedIdentifier { }

export class Procedural {
  private obj: ABAPObject;
//  private reg: Registry;
  private variables: Variables;

  constructor(obj: ABAPObject, _reg: Registry, variables: Variables) {
    this.obj = obj;
    this.variables = variables;
//    this.reg = reg;
  }

  public findDefinitions(node: StatementNode) {
    const sub = node.get();
    const ret: TypedIdentifier[] = [];

    if (sub instanceof Statements.Data
      || sub instanceof Statements.DataBegin
      || sub instanceof Statements.Constant
      || sub instanceof Statements.ConstantBegin
      || sub instanceof Statements.Static
      || sub instanceof Statements.StaticBegin) {
      ret.push(this.addVariable(node.findFirstExpression(Expressions.NamespaceSimpleName)));
    } else if (sub instanceof Statements.Parameter) {
      ret.push(this.addVariable(node.findFirstExpression(Expressions.FieldSub)));
    } else if (sub instanceof Statements.Tables || sub instanceof Statements.SelectOption) {
      ret.push(this.addVariable(node.findFirstExpression(Expressions.Field)));
    }

    this.variables.addList(ret);
  }

  public findFunctionScope(node: StatementNode) {
    this.variables.pushScope("function");

    const name = node.findFirstExpression(Expressions.FunctionName)!.getFirstToken().getStr();
    const definition = (this.obj as FunctionGroup).getModule(name);
    if (definition === undefined) {
      throw new Error("Function group definition \"" + name + "\" not found");
    }

    let abap = "";
    for (const param of definition.getParameters()) {
      abap = abap + "DATA " + param + " TYPE c.\n"; // todo, not correct type
    }
    const file = new MemoryFile("_function_module.prog.abap", abap);
    this.variables.addList(Globals.typesInFile(file));
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

  private addVariable(expr: ExpressionNode | undefined): TypedIdentifier {
    if (expr === undefined) { throw new Error("syntax_check, unexpected tree structure"); }
    // todo, these identifers should be possible to create from a Node
    // todo, how to determine the real types?
    const token = expr.getFirstToken();
    return new LocalIdentifier(token, expr);
  }

}