import {AbstractToken} from "../../1_lexer/tokens/abstract_token";
import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode, StatementNode} from "../../nodes";
import {CharacterType, IntegerType, NumericType, StructureType} from "../../types/basic";
import {AbstractType} from "../../types/basic/_abstract_type";
import {CurrentScope} from "../_current_scope";
import {SyntaxInput} from "../_syntax_input";
import {DatabaseTableSource} from "./database_table";
import {Dynamic} from "./dynamic";
import {Source} from "./source";
import {SQLIn} from "./sql_in";
import {SQLSource} from "./sql_source";

export class SQLCompare {

  public runSyntax(node: ExpressionNode | StatementNode, input: SyntaxInput, tables: DatabaseTableSource[]): void {

    let sourceType: AbstractType | undefined;
    let token: AbstractToken | undefined;

    if (node.getFirstChild()?.get() instanceof Expressions.Dynamic) {
      new Dynamic().runSyntax(node.getFirstChild() as ExpressionNode, input);
      return;
    }

    for (const s of node.findDirectExpressions(Expressions.SimpleSource3)) {
      new Source().runSyntax(s, input);
    }

    for (const s of node.findDirectExpressions(Expressions.SQLSource)) {
      for (const child of s.getChildren()) {
        if (child instanceof ExpressionNode) {
          token = child.getFirstToken();
          break;
        }
      }

      sourceType = new SQLSource().runSyntax(s, input);
    }

    const sqlin = node.findDirectExpression(Expressions.SQLIn);
    if (sqlin) {
      new SQLIn().runSyntax(sqlin, input);
    }

    const fieldName = node.findDirectExpression(Expressions.SQLFieldName)?.concatTokens();
    if (fieldName && sourceType && token) {
// check compatibility for rule sql_value_conversion
      const targetType = this.findType(fieldName, tables, input.scope);

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
        input.scope.addSQLConversion(fieldName, message, token);
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