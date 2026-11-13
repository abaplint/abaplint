import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode, StatementNode} from "../../nodes";
import {Source} from "../expressions/source";
import {StatementSyntax} from "../_statement_syntax";
import {Target} from "../expressions/target";
import {FSTarget} from "../expressions/fstarget";
import {ComponentCond} from "../expressions/component_cond";
import {AnyType, StructureType, TableAccessType, TableType, UnknownType, VoidType} from "../../types/basic";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";

export class ModifyInternal implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {

    // there is only one
    const target = node.findFirstExpression(Expressions.Target);
    // it might be a dynamic target
    const targetType = target ? Target.runSyntax(target, input) : undefined;

    // the FROM work area has the row type of the table, used for inferring "#"
    const rowType = targetType instanceof TableType ? targetType.getRowType() : undefined;
    const children = node.getChildren();
    for (let i = 0; i < children.length; i++) {
      const s = children[i];
      if (s instanceof ExpressionNode && s.get() instanceof Expressions.Source) {
        const isFrom = children[i - 1]?.concatTokens().toUpperCase() === "FROM";
        Source.runSyntax(s, input, isFrom ? rowType : undefined);
      }
    }

    if (target) {
      if (targetType instanceof VoidType
          || targetType instanceof AnyType
          || targetType instanceof UnknownType) {
        // ok
      } else if (targetType instanceof TableType) {
        if (node.findDirectTokenByText("TABLE") === undefined
            && node.findDirectTokenByText("INDEX")
            && targetType.getAccessType() === TableAccessType.hashed) {
          const message = "Implicit or explicit index operation on hashed table is not possible";
          input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
          return;
        }
        if (node.findDirectTokenByText("TABLE")
            && node.findDirectTokenByText("INDEX")
            && targetType.isWithHeader() === false) {
          // MODIFY TABLE INDEX
          const message = "Table does not have header line";
          input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
          return;
        }
      } else if (targetType instanceof StructureType) {
        // it might originate from a TABLES statement
        if (target.concatTokens().toUpperCase() !== targetType.getDDICName()) {
          const message = "Not an internal table";
          input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
          return;
        }
      } else {
        const message = "Not an internal table";
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      }
    }

    const fstarget = node.findDirectExpression(Expressions.FSTarget);
    if (fstarget) {
      FSTarget.runSyntax(fstarget, input, undefined);
    }

    for (const t of node.findDirectExpressions(Expressions.ComponentCond)) {
      ComponentCond.runSyntax(t, input);
    }

  }
}