import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode, StatementNode, TokenNode} from "../../nodes";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";
import {DataReference, DataType, TableAccessType, TableType, UnknownType, VoidType} from "../../types/basic";
import {AbstractType} from "../../types/basic/_abstract_type";
import {FSTarget} from "../expressions/fstarget";
import {StatementSyntax} from "../_statement_syntax";
import {InlineData} from "../expressions/inline_data";
import {TypeUtils} from "../_type_utils";
import {CheckSyntaxKey, SyntaxInput, syntaxIssue} from "../_syntax_input";

// todo: issue error for short APPEND if the source is without header line
export class Append implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {

    let targetType: AbstractType | undefined = undefined;

    const target = node.findDirectExpression(Expressions.Target);
    const children = node.getChildren();
    const to = children[children.length - 3];
    const endsAtDestination = target !== undefined && children[children.length - 2] === target
      && to instanceof TokenNode && to.get().getUpperStr() === "TO";
    if (target) {
      if (target.findDirectExpression(Expressions.TableExpression) !== undefined) {
        const message = "APPEND, table expression not allowed in target";
        input.issues.push(syntaxIssue(input, target.getFirstToken(), message));
        return;
      }
      targetType = Target.runSyntax(target, input);
    }

    // a hashed table has no index, APPEND adds at the end
    if (targetType instanceof TableType && targetType.getAccessType() === TableAccessType.hashed) {
      const message = "Implicit or explicit index operation on hashed table is not possible";
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return;
    }

    if (!endsAtDestination && targetType instanceof TableType && targetType.getAccessType() === TableAccessType.sorted) {
      const sorted = node.findDirectTokenByText("SORTED");
      if (sorted !== undefined) {
        input.issues.push(syntaxIssue(input, sorted, "APPEND SORTED BY requires a standard table"));
      }
    }

    const fsTarget = endsAtDestination ? undefined : node.findDirectExpression(Expressions.FSTarget);
    if (fsTarget) {
      if (!(targetType instanceof TableType) && !(targetType instanceof VoidType) && !(targetType instanceof UnknownType)) {
        const message = "APPEND to non table type, " + targetType?.constructor.name;
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      }
      const rowType = targetType instanceof TableType ? targetType.getRowType() : targetType;
      FSTarget.runSyntax(fsTarget, input, rowType);
    }

    const dataTarget = endsAtDestination ? undefined : node.findExpressionAfterToken("INTO");
    const inline = dataTarget?.findDirectExpression(Expressions.InlineData);
    if (inline) {
      if (!(targetType instanceof TableType) && !(targetType instanceof VoidType) && !(targetType instanceof UnknownType)) {
        const message = "APPEND to non table type, " + targetType?.constructor.name;
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      }
      const rowType = targetType instanceof TableType ? targetType.getRowType() : targetType;
      InlineData.runSyntax(inline, input, new DataReference(rowType));
    }

    const lineSpec = children[1];
    const lines = lineSpec instanceof TokenNode && lineSpec.get().getUpperStr() === "LINES";
    const source = lines ? children[3] : lineSpec;
    if (source instanceof ExpressionNode) {
      if (targetType !== undefined
          && !(targetType instanceof TableType)
          && !(targetType instanceof UnknownType)
          && dataTarget !== target
          && !(targetType instanceof VoidType)) {
        const message = `Append, target not a table type (${targetType.constructor.name})`;
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

      if (lines) {
        // hmm, checking only the row types are compatible will not check the table type, e.g. sorted or hashed
        // a generically typed dref->* is checked at runtime, except FROM idx1 TO idx2, which expect an index table
        const genericLines = sourceType instanceof DataType
          && source.concatTokens().replace(/\s/g, "").endsWith("->*")
          && node.findDirectTokenByText("FROM") === undefined
          && node.getChildren().filter(c => c instanceof TokenNode && c.getFirstToken().getStr().toUpperCase() === "TO").length === 1;
        if (sourceType instanceof TableType) {
          sourceType = sourceType.getRowType();
        } else if (genericLines) {
          sourceType = VoidType.get(CheckSyntaxKey);
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
        const from = node.findExpressionAfterToken("FROM");
        if (from) {
          Source.runSyntax(from, input);
        }
        const to = node.findExpressionAfterToken("TO");
        if (to?.get() instanceof Expressions.Source) {
          Source.runSyntax(to, input);
        }
      } else {
        if (new TypeUtils(input.scope).isAssignable(sourceType, rowType) === false) {
          const message = "Incompatible types";
          input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
          return;
        }
      }
    }

  }
}
