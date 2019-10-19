import * as Expressions from "../expressions";
import * as Statements from "../statements";
import * as Structures from "../structures";
import {StatementNode, ExpressionNode, StructureNode} from "../nodes";
import {Identifier} from "../types/_identifier";
import {ABAPObject} from "../../objects/_abap_object";
import {FormDefinition} from "../types";
import {Scope} from "./_scope";
import {FunctionGroup} from "../../objects";
import {ABAPFile} from "../../files";
import {Registry} from "../../registry";

// todo, rename this class? and what is it used for?
class LocalIdentifier extends Identifier { }

export class Procedural {
  private readonly scope: Scope;
  private readonly reg: Registry;

  constructor(reg: Registry, scope: Scope) {
    this.scope = scope;
    this.reg = reg;
  }

  public addFormDefinitions(file: ABAPFile) {
    this.scope.addFormDefinitions(file.getFormDefinitions());

    const stru = file.getStructure();
    if (stru === undefined) {
      return;
    }

    const includes = stru.findAllStatements(Statements.Include);
    for (const node of includes) {
      const found = this.findInclude(node);
      if (found) {
        this.addFormDefinitions(found);
      }
    }
  }

  public findInclude(node: StatementNode): ABAPFile | undefined {
// assumption: no cyclic includes, includes not found are reported by rule "check_include"
    const expr = node.findFirstExpression(Expressions.IncludeName);
    if (expr === undefined) {
      return undefined;
    }
    const name = expr.getFirstToken().getStr();
    const prog = this.reg.getObject("PROG", name) as ABAPObject | undefined;
    if (prog !== undefined) {
      return prog.getABAPFiles()[0];
    }
    return undefined;
  }

  public checkPerform(node: StatementNode) {
    if (!(node.get() instanceof Statements.Perform)) {
      throw new Error("checkPerform unexpected node type");
    }

    if (node.findFirstExpression(Expressions.IncludeName)) {
      return; // in external program, not checked, todo
    }

    if (node.findFirstExpression(Expressions.Dynamic)) {
      return; // todo, some parts can be checked
    }

    const expr = node.findFirstExpression(Expressions.FormName);
    if (expr === undefined) {
      return; // it might be a dynamic call
    }

    const name = expr.getFirstToken().getStr();

    if (this.scope.findFormDefinition(name) === undefined) {
      throw new Error("FORM definition \"" + name + "\" not found");
    }
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

    this.scope.addList(ret);
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
      this.scope.addIdentifier(this.buildVariable(expr, filename));
    }
  }

  public findFunctionScope(obj: ABAPObject, node: StatementNode) {
    this.scope.pushScope("function");

    const name = node.findFirstExpression(Expressions.FunctionName)!.getFirstToken().getStr();
    const definition = (obj as FunctionGroup).getModule(name);
    if (definition === undefined) {
      throw new Error("Function group definition \"" + name + "\" not found");
    }

    for (const param of definition.getParameters()) {
      this.scope.addName(param);
    }
  }

  public findFormScope(node: StatementNode, filename: string) {
    this.scope.pushScope("form");
    this.scope.addList(new FormDefinition(node, filename).getParameters());
  }

  private buildVariable(expr: ExpressionNode | undefined, filename: string): Identifier {
    if (expr === undefined) { throw new Error("syntax_check, unexpected tree structure"); }
    // todo, these identifers should be possible to create from a Node
    // todo, how to determine the real types?
    const token = expr.getFirstToken();
    return new LocalIdentifier(token, filename);
  }

}