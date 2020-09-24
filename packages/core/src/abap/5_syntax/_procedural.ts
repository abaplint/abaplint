import * as Expressions from "../2_statements/expressions";
import * as Statements from "../2_statements/statements";
import * as Structures from "../3_structures/structures";
import {StatementNode} from "../nodes";
import {ABAPObject} from "../../objects/_abap_object";
import {FormDefinition, FunctionModuleParameterDirection} from "../types";
import {CurrentScope} from "./_current_scope";
import {ScopeType} from "./_scope_type";
import {FunctionGroup} from "../../objects";
import {ABAPFile} from "../../files";
import {IRegistry} from "../../_iregistry";
import {TypedIdentifier} from "../types/_typed_identifier";
import {TableType, CharacterType} from "../types/basic";
import {DDIC} from "../../ddic";
import {AbstractType} from "../types/basic/_abstract_type";

export class Procedural {
  private readonly scope: CurrentScope;
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry, scope: CurrentScope) {
    this.scope = scope;
    this.reg = reg;
  }

  public addAllFormDefinitions(file: ABAPFile, obj: ABAPObject) {
    const structure = file.getStructure();
    if (structure) {
      for (const found of structure.findAllStructures(Structures.Form)) {
        this.scope.addFormDefinitions([new FormDefinition(found, file.getFilename(), this.scope)]);
      }
    }

    const stru = file.getStructure();
    if (stru === undefined) {
      return;
    }

    const includes = stru.findAllStatements(Statements.Include);
    for (const node of includes) {
      const found = this.findInclude(node, obj);
      if (found) {
        this.addAllFormDefinitions(found, obj);
      }
    }
  }

  public findInclude(node: StatementNode, obj: ABAPObject): ABAPFile | undefined {
// assumption: no cyclic includes, includes not found are reported by rule "check_include"
// todo: how to make sure code is not duplicated here and in rule "check_include" ?
    const expr = node.findFirstExpression(Expressions.IncludeName);
    if (expr === undefined) {
      return undefined;
    }
    const name = expr.getFirstToken().getStr();

    if (obj instanceof FunctionGroup) {
      const incl = obj.getInclude(name);
      if (incl !== undefined) {
        return incl;
      }
    }

    const prog = this.reg.getObject("PROG", name) as ABAPObject | undefined;
    if (prog !== undefined) {
      return prog.getABAPFiles()[0];
    }
    return undefined;
  }

  public findFunctionScope(obj: ABAPObject, node: StatementNode, filename: string) {
    if (!(obj instanceof FunctionGroup)) {
      throw new Error("findFunctionScope, expected function group input");
    }

    const nameToken = node.findFirstExpression(Expressions.Field)!.getFirstToken();
    const name = nameToken.getStr();
    this.scope.push(ScopeType.FunctionModule, name, node.getFirstToken().getStart(), filename);

    const definition = obj.getModule(name);
    if (definition === undefined) {
      throw new Error("Function module definition \"" + name + "\" not found");
    }

    const ddic = new DDIC(this.reg);

    for (const param of definition.getParameters()) {
      let found: TypedIdentifier | AbstractType = new CharacterType(1); // fallback
      if (param.type) {
        found = ddic.lookup(param.type);
      }
      if (param.direction === FunctionModuleParameterDirection.tables) {
        found = new TableType(found, true);
      }
      const type = new TypedIdentifier(nameToken, filename, found);
      this.scope.addNamedIdentifier(param.name, type);
    }
  }

  public findFormScope(node: StatementNode, filename: string) {
    const form = new FormDefinition(node, filename, this.scope);
    this.scope.push(ScopeType.Form, form.getName(), node.getFirstToken().getStart(), filename);

    this.scope.addList(form.getUsingParameters());
    this.scope.addList(form.getChangingParameters());
    this.scope.addList(form.getTablesParameters());
  }

}