import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {Target} from "../expressions/target";
import {Dynamic} from "../expressions/dynamic";
import {StatementSyntax} from "../_statement_syntax";
import {AnyType, StructureType, TableAccessType, TableType, UnknownType, VoidType} from "../../types/basic";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";

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
          const message = `Sorted table, already sorted`;
          input.issues.push(syntaxIssue(input, tnode.getFirstToken(), message));
          return;
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
              const message = "SORT, table row is not structured";
              input.issues.push(syntaxIssue(input, tnode.getFirstToken(), message));
              return;
            } else if (rowType.getComponentByName(cname) === undefined) {
              const message = `Field ${cname} does not exist in table row structure`;
              input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
              return;
            }
          }
        }
      } else if (ttype !== undefined
          && !(ttype instanceof VoidType)
          && !(ttype instanceof UnknownType)
          && !(ttype instanceof AnyType)) {
        const message = "SORT, must be a internal table";
        input.issues.push(syntaxIssue(input, tnode.getFirstToken(), message));
        return;
      }
    }

  }
}