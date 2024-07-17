import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {Target} from "../expressions/target";
import {Dynamic} from "../expressions/dynamic";
import {StatementSyntax} from "../_statement_syntax";
import {AnyType, StructureType, TableAccessType, TableType, UnknownType, VoidType} from "../../types/basic";
import {SyntaxInput} from "../_syntax_input";

export class Sort implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {

    for (const s of node.findDirectExpressions(Expressions.Dynamic)) {
      new Dynamic().runSyntax(s, input);
    }

    const tnode = node.findDirectExpression(Expressions.Target);
    if (tnode) {
      const ttype = new Target().runSyntax(tnode, input);
      if (ttype instanceof TableType) {
        if (ttype.getOptions()?.primaryKey?.type === TableAccessType.sorted) {
          throw new Error(`Sorted table, already sorted`);
        }
        const rowType = ttype.getRowType();
        if (!(rowType instanceof VoidType)
            && !(rowType instanceof UnknownType)
            && !(rowType instanceof AnyType)) {
          for (const component of node.findAllExpressions(Expressions.ComponentChain)) {
            if (component.getChildren().length > 1) {
              continue;
            }
            const cname = component.concatTokens().toUpperCase();
            if (cname === "TABLE_LINE") {
              continue;
            } else if (!(rowType instanceof StructureType)) {
              throw new Error("SORT, table row is not structured");
            } else if (rowType.getComponentByName(cname) === undefined) {
              throw new Error(`Field ${cname} does not exist in table row structure`);
            }
          }
        }
      } else if (ttype !== undefined
          && !(ttype instanceof VoidType)
          && !(ttype instanceof UnknownType)
          && !(ttype instanceof AnyType)) {
        throw new Error("SORT, must be a internal table");
      }
    }

  }
}