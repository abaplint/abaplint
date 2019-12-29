import * as Expressions from "../expressions";
import * as Statements from "../statements";
import {StatementNode} from "../nodes";
import {ABAPObject} from "../../objects/_abap_object";
import {FormDefinition} from "../types";
import {Scope, ScopeType} from "./_scope";
import {FunctionGroup} from "../../objects";
import {ABAPFile} from "../../files";
import {Registry} from "../../registry";
import {TypedIdentifier} from "../types/_typed_identifier";
import {IntegerType} from "../types/basic";

export class Procedural {
  private readonly scope: Scope;
  private readonly reg: Registry;

  constructor(reg: Registry, scope: Scope) {
    this.scope = scope;
    this.reg = reg;
  }

  public addAllFormDefinitions(file: ABAPFile) {
    this.scope.addFormDefinitions(file.getFormDefinitions());

    const stru = file.getStructure();
    if (stru === undefined) {
      return;
    }

    const includes = stru.findAllStatements(Statements.Include);
    for (const node of includes) {
      const found = this.findInclude(node);
      if (found) {
        this.addAllFormDefinitions(found);
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

  public findFunctionScope(obj: ABAPObject, node: StatementNode, filename: string) {
    const nameToken = node.findFirstExpression(Expressions.FunctionName)!.getFirstToken();
    const name = nameToken.getStr();
    this.scope.push(ScopeType.Function, name);

    const definition = (obj as FunctionGroup).getModule(name);
    if (definition === undefined) {
      throw new Error("Function group definition \"" + name + "\" not found");
    }

    for (const param of definition.getParameters()) {
      const type = new TypedIdentifier(nameToken, filename, new IntegerType()); // todo, add real type
      this.scope.addNamedIdentifier(param, type);
    }
  }

  public findFormScope(node: StatementNode, filename: string) {
    const form = new FormDefinition(node, filename);
    this.scope.push(ScopeType.Form, form.getName());
    this.scope.addList(form.getParameters(this.scope));
  }

}