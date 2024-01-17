import {AbstractToken} from "../../1_lexer/tokens/abstract_token";
import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode, StatementNode} from "../../nodes";
import {CharacterType, IntegerType, NumericType, StructureType, TableType, UnknownType, VoidType} from "../../types/basic";
import {AbstractType} from "../../types/basic/_abstract_type";
import {CurrentScope} from "../_current_scope";
import {DatabaseTableSource} from "./database_table";
import {Source} from "./source";
import {SQLSource} from "./sql_source";

export class SQLCompare {

  public runSyntax(node: ExpressionNode | StatementNode, scope: CurrentScope, filename: string, tables: DatabaseTableSource[]): void {

    let sourceType: AbstractType | undefined;
    let token: AbstractToken | undefined;

    for (const s of node.findAllExpressions(Expressions.SimpleSource3)) {
      new Source().runSyntax(s, scope, filename);
    }

    for (const s of node.findAllExpressions(Expressions.SQLSource)) {
      for (const child of s.getChildren()) {
        if (child instanceof ExpressionNode) {
          token = child.getFirstToken();
          break;
        }
      }

      sourceType = new SQLSource().runSyntax(s, scope, filename);
    }

    const sqlin = node.findDirectExpression(Expressions.SQLIn);
    if (sqlin && sqlin.getChildren().length === 2) {
      const insource = node.findFirstExpression(Expressions.SQLSource);
      if (insource) {
        const intype = new SQLSource().runSyntax(insource, scope, filename);
        if (intype &&
            !(intype instanceof VoidType) &&
            !(intype instanceof UnknownType) &&
            !(intype instanceof TableType)) {
          throw new Error("IN, not a table");
        }
      }
    }

    const fieldName = node.findDirectExpression(Expressions.SQLFieldName)?.concatTokens();
    if (fieldName && sourceType && token) {
// check compatibility for rule sql_value_conversion
      const targetType = this.findType(fieldName, tables, scope);

      let message = "";
      if (sourceType instanceof IntegerType
          && targetType instanceof CharacterType) {
        message = "Integer to CHAR conversion";
      } else if (sourceType instanceof IntegerType
          && targetType instanceof NumericType) {
        message = "Integer to NUMC conversion";
      } else if (sourceType instanceof NumericType
          && targetType instanceof IntegerType) {
        message = "NUMC to Integer conversion";
      } else if (sourceType instanceof CharacterType
          && targetType instanceof IntegerType) {
        message = "CHAR to Integer conversion";
      } else if (sourceType instanceof CharacterType
          && targetType instanceof CharacterType
          && sourceType.getLength() > targetType.getLength()) {
        message = "Source field longer than database field, CHAR -> CHAR";
      } else if (sourceType instanceof NumericType
          && targetType instanceof NumericType
          && sourceType.getLength() > targetType.getLength()) {
        message = "Source field longer than database field, NUMC -> NUMC";
      }
      if (message !== "") {
        scope.addSQLConversion(fieldName, message, token);
      }
    }
  }

  private findType(fieldName: string, tables: DatabaseTableSource[], scope: CurrentScope): AbstractType | undefined {
    for (const t of tables) {
      const type = t?.parseType(scope.getRegistry());
      if (type instanceof StructureType) {
        return type.getComponentByName(fieldName);
      }
    }
    return undefined;
  }

}