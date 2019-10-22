import * as Expressions from "../expressions";
import * as Statements from "../statements";
import * as Structures from "../structures";
import {StatementNode, StructureNode} from "../nodes";
import {Identifier} from "../types/_identifier";
import {ABAPObject} from "../../objects/_abap_object";
import {FormDefinition} from "../types";
import {Scope} from "./_scope";
import {FunctionGroup} from "../../objects";
import {ABAPFile} from "../../files";
import {Registry} from "../../registry";
import {BasicTypes} from "./basic_types";

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

// todo, also check parameters match
    if (this.scope.findFormDefinition(name) === undefined) {
      throw new Error("FORM definition \"" + name + "\" not found");
    }
  }

  public addDefinitions(node: StatementNode, filename: string) {
    const type = new BasicTypes(filename, this.scope).buildTypes(node);
    if (type) {
      this.scope.addType(type);
      return;
    }

    const variable = new BasicTypes(filename, this.scope).buildVariables(node);
    if (variable) {
      this.scope.addList([variable]);
    }
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
      const token = expr.getFirstToken();
      this.scope.addIdentifier(new Identifier(token, filename));
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

}