import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {Source} from "../expressions/source";
import {StatementSyntax} from "../_statement_syntax";
import {Target} from "../expressions/target";
import {FSTarget} from "../expressions/fstarget";
import {ComponentCond} from "../expressions/component_cond";
import {AnyType, StructureType, TableType, UnknownType, VoidType} from "../../types/basic";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";

export class ModifyInternal implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      Source.runSyntax(s, input);
    }

    // there is only one
    const target = node.findFirstExpression(Expressions.Target);
    const targetExpression = target;
    if (targetExpression) {
      // it might be a dynamic target
      const targetType = Target.runSyntax(targetExpression, input);
      if (targetType instanceof VoidType
          || targetType instanceof AnyType
          || targetType instanceof UnknownType) {
        // ok
      } else if (targetType instanceof TableType) {
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