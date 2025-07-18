import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {IStructureComponent, StructureType, TableKeyType, TableType, UnknownType, VoidType} from "../../types/basic";
import {InlineData} from "./inline_data";
import {Target} from "./target";
import {SQLFrom} from "./sql_from";
import {SQLForAllEntries} from "./sql_for_all_entries";
import {ScopeType} from "../_scope_type";
import {SQLSource} from "./sql_source";
import {SQLCompare} from "./sql_compare";
import {DatabaseTableSource} from "./database_table";
import {AbstractType} from "../../types/basic/_abstract_type";
import {SQLOrderBy} from "./sql_order_by";
import {Dynamic} from "./dynamic";
import {ReferenceType} from "../_reference";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";

type FieldList = {code: string, as: string, expression: ExpressionNode}[];
const isSimple = /^\w+$/;

export class Select {
  public static runSyntax(node: ExpressionNode, input: SyntaxInput, skipImplicitInto = false): void {
    const token = node.getFirstToken();

    const from = node.findDirectExpression(Expressions.SQLFrom);
    const dbSources = from ? SQLFrom.runSyntax(from, input) : [];
    if (from === undefined) {
      const message = `Missing FROM`;
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return;
    }

    const fields = this.findFields(node, input);
    if (fields.length === 0
        && node.findDirectExpression(Expressions.SQLFieldListLoop) === undefined
        && node.findDirectExpression(Expressions.SQLAggregation) === undefined) {
      const message = `SELECT: fields missing`;
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return;
    }

    this.checkFields(fields, dbSources, input, node);

    this.handleInto(node, input, fields, dbSources);

    const fae = node.findDirectExpression(Expressions.SQLForAllEntries);
    if (fae) {
      input.scope.push(ScopeType.OpenSQL, "SELECT", token.getStart(), input.filename);
      SQLForAllEntries.runSyntax(fae, input);
    }

    for (const t of node.findAllExpressions(Expressions.Target)) {
      Target.runSyntax(t, input);
    }

    // check implicit into, the target field is implict equal to the table name
    if (skipImplicitInto === false
        && node.findDirectExpression(Expressions.SQLIntoTable) === undefined
        && node.findDirectExpression(Expressions.SQLIntoList) === undefined
        && node.findDirectExpression(Expressions.SQLIntoStructure) === undefined) {
      const fields = node.findFirstExpression(Expressions.SQLAggregation)?.concatTokens();
      const c = new RegExp(/^count\(\s*\*\s*\)$/, "i");
      if (fields === undefined || c.test(fields) === false) {
        const nameToken = from?.findDirectExpression(Expressions.SQLFromSource);
        if (nameToken) {
          const found = input.scope.findVariable(nameToken.concatTokens());
          if (found) {
            input.scope.addReference(nameToken.getFirstToken(), found, ReferenceType.DataWriteReference, input.filename);
          } else {
            const message = `Target variable ${nameToken.concatTokens()} not found in scope`;
            input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
            return;
          }
        }
      }
    }

    // OFFSET
    for (const s of node.findDirectExpressions(Expressions.SQLSource)) {
      SQLSource.runSyntax(s, input);
    }
    for (const up of node.findDirectExpressions(Expressions.SQLUpTo)) {
      for (const s of up.findDirectExpressions(Expressions.SQLSource)) {
        SQLSource.runSyntax(s, input);
      }
    }
    for (const fae of node.findDirectExpressions(Expressions.SQLForAllEntries)) {
      for (const s of fae.findDirectExpressions(Expressions.SQLSource)) {
        SQLSource.runSyntax(s, input);
      }
    }

    for (const s of node.findAllExpressions(Expressions.SQLCompare)) {
      SQLCompare.runSyntax(s, input, dbSources);
    }

    for (const s of node.findDirectExpressions(Expressions.SQLOrderBy)) {
      SQLOrderBy.runSyntax(s, input);
    }

    if (this.isStrictMode(node)) {
      this.strictModeChecks(node, input);
    }

    if (input.scope.getType() === ScopeType.OpenSQL) {
      input.scope.pop(node.getLastToken().getEnd());
    }
  }

  // there are multiple rules, but gotta start somewhere
  private static isStrictMode(node: ExpressionNode) {
    const into = node.findDirectExpressionsMulti([Expressions.SQLIntoList, Expressions.SQLIntoStructure, Expressions.SQLIntoTable])[0];
    const where = node.findDirectExpression(Expressions.SQLCond);

    // INTO is after WHERE
    if (into && where && into.getFirstToken().getStart().isAfter(where.getFirstToken().getStart())) {
      return true;
    }

    // FIELDS is used
    if (node.findFirstExpression(Expressions.SQLFields)) {
      return true;
    }

    // any field is escaped with @
    for (const source of node.findAllExpressions(Expressions.SQLSource)) {
      if (source.getFirstToken().getStr() === "@") {
        return true;
      }
    }

    // comma used in FROM
    const fieldList = node.findFirstExpression(Expressions.SQLFieldList);
    if (fieldList && fieldList.findDirectTokenByText(",")) {
      return true;
    }

    return false;
  }

  private static strictModeChecks(node: ExpressionNode, input: SyntaxInput) {

    const sources = node.findAllExpressions(Expressions.SQLSource);
    for (const source of sources) {
      const first = source.getFirstChild();
      if (first?.get() instanceof Expressions.SQLAliasField) {
        continue;
      } else if (first?.getFirstToken().getStr() === "@") {
        continue;
      } else if (first?.getChildren()[0].get() instanceof Expressions.Constant) {
        continue;
      }
      const message = `SELECT: "${source.concatTokens()}" must be escaped with @ in strict mode`;
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
    }
  }

  private static handleInto(node: ExpressionNode, input: SyntaxInput, fields: FieldList, dbSources: DatabaseTableSource[]) {
    const intoTable = node.findDirectExpression(Expressions.SQLIntoTable);
    if (intoTable) {
      const inline = intoTable.findFirstExpression(Expressions.InlineData);
      if (inline) {
        InlineData.runSyntax(inline, input, this.buildTableType(fields, dbSources, input.scope));
      }
    }

    const intoStructure = node.findDirectExpression(Expressions.SQLIntoStructure);
    if (intoStructure) {
      for (const inline of intoStructure.findAllExpressions(Expressions.InlineData)) {
        // todo, for now these are voided
        InlineData.runSyntax(inline, input, VoidType.get("SELECT_todo"));
      }
    }

    const intoList = node.findDirectExpression(Expressions.SQLIntoList);
    if (intoList) {
      const isDynamic = fields.length === 1 && fields[0].expression.findDirectExpression(Expressions.Dynamic) !== undefined;
      const targets = intoList.findDirectExpressions(Expressions.SQLTarget);
      if (targets.length !== fields.length && isDynamic !== true) {
        const message = `number of fields selected vs list does not match`;
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      }

      for (let i = 0; i < targets.length; i++) {
        const target = targets[i];
        const field = fields[i];

        const inline = target.findFirstExpression(Expressions.InlineData);
        if (inline) {
          if (isDynamic) {
            const message = `dynamic field list, inlining not possible`;
            input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
            return;
          }

          let type: AbstractType = VoidType.get("SELECT_todo");

          if (isSimple.test(field.code)) {
            for (const dbSource of dbSources) {
              if (dbSource === undefined) {
                continue;
              }
              const dbType = dbSource.parseType(input.scope.getRegistry());
              if (dbType instanceof StructureType) {
                const found = dbType.getComponentByName(field.code);
                if (found) {
                  type = found;
                  break;
                }
              }
            }
          }

          InlineData.runSyntax(inline, input, type);
        }
      }
    }
  }

  private static checkFields(fields: FieldList, dbSources: DatabaseTableSource[], input: SyntaxInput, node: ExpressionNode) {
    if (dbSources.length > 1) {
      return;
    }

    const first = dbSources[0];
    if (first === undefined) {
      // then its voided
      return;
    }

    const type = first.parseType(input.scope.getRegistry());
    if (type instanceof VoidType || type instanceof UnknownType) {
      return;
    }
    if (!(type instanceof StructureType)) {
      const message = "checkFields, expected structure, " + type.constructor.name;
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return;
    }

    for (const field of fields) {
      if (field.code === "*") {
        continue;
      }

      if (isSimple.test(field.code) && type.getComponentByName(field.code) === undefined) {
        const message = `checkFields, field ${field.code} not found`;
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      }
    }
  }

  private static buildTableType(fields: FieldList, dbSources: DatabaseTableSource[], scope: CurrentScope) {
    if (dbSources.length !== 1) {
      return VoidType.get("SELECT_todo");
    }

    if (dbSources[0] === undefined) {
      // then its a voided table
      return VoidType.get("SELECT_todo");
    }
    const dbType = dbSources[0].parseType(scope.getRegistry());
    if (!(dbType instanceof StructureType)) {
      return VoidType.get("SELECT_todo");
    }

    if (fields.length === 1 && fields[0].code === "*") {
      return new TableType(dbType, {withHeader: false, keyType: TableKeyType.default}, undefined);
    }

    const allFieldsSimple = fields.every(f => isSimple.test(f.code));
    if (allFieldsSimple === true) {
      const components: IStructureComponent[] = [];
      for (const field of fields) {
        const type = dbType.getComponentByName(field.code);
        if (type === undefined) {
          return VoidType.get("SELECT_todo");
        }
        components.push({name: field.code, type});
      }
      return new TableType(new StructureType(components), {withHeader: false, keyType: TableKeyType.default}, undefined);
    }

    return VoidType.get("SELECT_todo");
  }

  private static findFields(node: ExpressionNode, input: SyntaxInput): FieldList {
    let expr: ExpressionNode | undefined = undefined;
    const ret = [];

    if (node.get() instanceof Expressions.SelectLoop) {
      expr = node.findFirstExpression(Expressions.SQLFieldListLoop);
    } else {
      expr = node.findFirstExpression(Expressions.SQLFieldList);
    }

    if (expr?.getFirstChild()?.get() instanceof Expressions.Dynamic) {
      Dynamic.runSyntax(expr.getFirstChild() as ExpressionNode, input);
    }

    for (const field of expr?.findDirectExpressionsMulti([Expressions.SQLField, Expressions.SQLFieldName]) || []) {
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