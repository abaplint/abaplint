import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {StructureType, UnknownType, VoidType} from "../../types/basic";
import {InlineData} from "./inline_data";
import {Target} from "./target";
import {SQLFrom} from "./sql_from";
import {SQLForAllEntries} from "./sql_for_all_entries";
import {ScopeType} from "../_scope_type";
import {SQLSource} from "./sql_source";
import {SQLCompare} from "./sql_compare";
import {DatabaseTableSource} from "./database_table";

type FieldList = {code: string, as: string, expression: ExpressionNode}[];

export class Select {
  public runSyntax(node: ExpressionNode, scope: CurrentScope, filename: string, skipImplicitInto = false): void {
    const token = node.getFirstToken();

    const from = node.findDirectExpression(Expressions.SQLFrom);
    const dbSources = from ? new SQLFrom().runSyntax(from, scope, filename) : [];

    const fields = this.findFields(node);
    if (fields.length === 0
        && node.findDirectExpression(Expressions.SQLFieldListLoop) === undefined) {
      throw new Error(`fields missing`);
    }

    this.checkFields(fields, dbSources, scope);

    for (const inline of node.findAllExpressions(Expressions.InlineData)) {
      // todo, for now these are voided
      new InlineData().runSyntax(inline, scope, filename, this.buildType(fields));
    }

    const fae = node.findDirectExpression(Expressions.SQLForAllEntries);
    if (fae) {
      scope.push(ScopeType.OpenSQL, "SELECT", token.getStart(), filename);
      new SQLForAllEntries().runSyntax(fae, scope, filename);
    }

    for (const t of node.findAllExpressions(Expressions.Target)) {
      new Target().runSyntax(t, scope, filename);
    }

    // check implicit into, the target field is implict equal to the table name
    if (skipImplicitInto === false
        && node.findDirectExpression(Expressions.SQLIntoTable) === undefined
        && node.findDirectExpression(Expressions.SQLIntoStructure) === undefined) {
      const fields = node.findFirstExpression(Expressions.SQLAggregation)?.concatTokens();
      const c = new RegExp(/^count\(\s*\*\s*\)$/, "i");
      if (fields === undefined || c.test(fields) === false) {
        const name = from?.findDirectExpression(Expressions.SQLFromSource)?.concatTokens();
        if (name && scope.findVariable(name) === undefined) {
          throw new Error(`Target variable ${name} not found in scope`);
        }
      }
    }

    // OFFSET
    for (const s of node.findDirectExpressions(Expressions.SQLSource)) {
      new SQLSource().runSyntax(s, scope, filename);
    }
    for (const up of node.findDirectExpressions(Expressions.SQLUpTo)) {
      for (const s of up.findDirectExpressions(Expressions.SQLSource)) {
        new SQLSource().runSyntax(s, scope, filename);
      }
    }
    for (const fae of node.findDirectExpressions(Expressions.SQLForAllEntries)) {
      for (const s of fae.findDirectExpressions(Expressions.SQLSource)) {
        new SQLSource().runSyntax(s, scope, filename);
      }
    }

    for (const s of node.findAllExpressions(Expressions.SQLCompare)) {
      new SQLCompare().runSyntax(s, scope, filename, dbSources);
    }

    if (scope.getType() === ScopeType.OpenSQL) {
      scope.pop(node.getLastToken().getEnd());
    }
  }

  private checkFields(fields: FieldList, dbSources: DatabaseTableSource[], scope: CurrentScope) {
    if (dbSources.length > 1) {
      return;
    }

    const first = dbSources[0];
    if (first === undefined) {
      // then its voided
      return;
    }

    const type = first.parseType(scope.getRegistry());
    if (type instanceof VoidType || type instanceof UnknownType) {
      return;
    }
    if (!(type instanceof StructureType)) {
      throw new Error("checkFields, expected structure, " + type.constructor.name);
    }

    for (const field of fields) {
      if (field.code === "*") {
        continue;
      }

// todo
    }

  }

  private buildType(_fields: FieldList) {
    return new VoidType("SELECT_todo");
  }

  private findFields(node: ExpressionNode): FieldList {
    let expr: ExpressionNode | undefined = undefined;
    const ret = [];

    expr = node.findDirectExpression(Expressions.SQLFieldList);
    if (expr === undefined) {
      expr = node.findDirectExpression(Expressions.SQLFields);
    }
    if (expr === undefined) {
      node.findDirectExpression(Expressions.SQLFieldName);
    }

    for (const field of expr?.findAllExpressions(Expressions.SQLField) || []) {
      let code = field.concatTokens().toUpperCase();
      const as = field.findDirectExpression(Expressions.SQLAsName)?.concatTokens() || "";
      if (as !== "") {
        code = code.replace(" AS " + as, "");
      }
      ret.push({code, as, expression: field});
    }

    if (ret.length === 0 && expr) {
      ret.push({code: expr.concatTokens(), as: "", expression: expr});
    }

    return ret;
  }
}