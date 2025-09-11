import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";
import {DataReference, TableType, UnknownType, VoidType} from "../../types/basic";
import {AbstractType} from "../../types/basic/_abstract_type";
import {FSTarget} from "../expressions/fstarget";
import {StatementSyntax} from "../_statement_syntax";
import {InlineData} from "../expressions/inline_data";
import {TypeUtils} from "../_type_utils";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";

// todo: issue error for short APPEND if the source is without header line
export class Append implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {

    let targetType: AbstractType | undefined = undefined;

    const target = node.findDirectExpression(Expressions.Target);
    if (target) {
      targetType = Target.runSyntax(target, input);
    }

    const fsTarget = node.findExpressionAfterToken("ASSIGNING");
    if (fsTarget && fsTarget.get() instanceof Expressions.FSTarget) {
      if (!(targetType instanceof TableType) && !(targetType instanceof VoidType)) {
        const message = "APPEND to non table type";
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      }
      const rowType = targetType instanceof TableType ? targetType.getRowType() : targetType;
      FSTarget.runSyntax(fsTarget, input, rowType);
    }

    const dataTarget = node.findExpressionAfterToken("INTO");
    if (dataTarget && node.concatTokens().toUpperCase().includes(" REFERENCE INTO DATA(")) {
      if (!(targetType instanceof TableType) && !(targetType instanceof VoidType)) {
        const message = "APPEND to non table type";
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      }
      const rowType = targetType instanceof TableType ? targetType.getRowType() : targetType;
      InlineData.runSyntax(dataTarget, input, new DataReference(rowType));
    }

    let source = node.findDirectExpression(Expressions.SimpleSource4);
    if (source === undefined) {
      source = node.findDirectExpression(Expressions.Source);
    }
    if (source) {
      if (targetType !== undefined
          && !(targetType instanceof TableType)
          && dataTarget !== target
          && !(targetType instanceof VoidType)) {
        const message = "Append, target not a table type";
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      }

      let rowType: AbstractType | undefined = undefined;
      if (targetType instanceof TableType) {
        rowType = targetType.getRowType();
      } else if (targetType instanceof VoidType) {
        rowType = targetType;
      }
      let sourceType = Source.runSyntax(source, input, rowType);

      if (node.findDirectTokenByText("LINES")) {
        // hmm, checking only the row types are compatible will not check the table type, e.g. sorted or hashed
        if (sourceType instanceof TableType) {
          sourceType = sourceType.getRowType();
        } else if (!(sourceType instanceof VoidType) && !(sourceType instanceof UnknownType)) {
          const message = "LINES OF must be a table type";
          input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
          return;
        }
        if (targetType instanceof TableType) {
          targetType = targetType.getRowType();
        }
        if (new TypeUtils(input.scope).isAssignable(sourceType, targetType) === false) {
          const message = "Incompatible types";
          input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
          return;
        }
      } else {
        if (new TypeUtils(input.scope).isAssignable(sourceType, rowType) === false) {
          const message = "Incompatible types";
          input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
          return;
        }
      }
    }

    const from = node.findExpressionAfterToken("FROM");
    if (from && from.get() instanceof Expressions.Source) {
      Source.runSyntax(from, input);
    }
    const to = node.findExpressionAfterToken("TO");
    if (to && to.get() instanceof Expressions.Source) {
      Source.runSyntax(to, input);
    }

  }
}