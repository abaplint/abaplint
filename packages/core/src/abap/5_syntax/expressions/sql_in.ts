import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode, StatementNode} from "../../nodes";
import {AnyType, StructureType, TableType, UnknownType, VoidType} from "../../types/basic";
import {AbstractType} from "../../types/basic/_abstract_type";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";
import {SQLSetOpGroup} from "./sql_set_op_group";
import {SQLSource} from "./sql_source";

const RANGE_COMPONENTS = ["SIGN", "OPTION", "LOW", "HIGH"];

export class SQLIn {

  public static runSyntax(node: ExpressionNode | StatementNode, input: SyntaxInput): void {

    const setop = node.findDirectExpression(Expressions.SQLSetOpGroup);
    if (setop) {
      SQLSetOpGroup.runSyntax(setop, input);
      return;
    }

    if (node.getChildren().length === 2) {
      const insource = node.findFirstExpression(Expressions.SQLSource);
      if (insource) {
        const intype = SQLSource.runSyntax(insource, input);
        if (intype &&
            !(intype instanceof VoidType) &&
            !(intype instanceof UnknownType) &&
            !(intype instanceof TableType)) {
          const message = "IN, not a table";
          input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
          return;
        }
        if (intype instanceof TableType && this.isRangeRow(intype.getRowType()) === false) {
          const name = insource.concatTokens().replace(/^@/, "").replace(/\[\]$/, "");
          const message = `row structure of ${name} is not correct`;
          input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
          return;
        }
      }
      return;
    }

    for (const s of node.findDirectExpressions(Expressions.SQLSource)) {
      SQLSource.runSyntax(s, input);
    }
    for (const s of node.findDirectExpressions(Expressions.SQLSourceNoSpace)) {
      SQLSource.runSyntax(s, input);
    }

  }

  // "IN itab" expects a ranges table, ie. the row must have SIGN, OPTION, LOW and HIGH
  private static isRangeRow(rowType: AbstractType): boolean {
    if (rowType instanceof VoidType || rowType instanceof UnknownType || rowType instanceof AnyType) {
      return true;
    } else if (!(rowType instanceof StructureType)) {
      return false;
    }
    return RANGE_COMPONENTS.every(c => rowType.getComponentByName(c) !== undefined);
  }

}
