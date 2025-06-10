import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";
import {StringType, TableType, UnknownType, VoidType, XStringType} from "../../types/basic";
import {InlineData} from "../expressions/inline_data";
import {StatementSyntax} from "../_statement_syntax";
import {TypeUtils} from "../_type_utils";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";

export class Concatenate implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
    const byteMode = node.findDirectTokenByText("BYTE") !== undefined;
    const linesMode = node.findDirectTokenByText("LINES") !== undefined;

    const target = node.findFirstExpression(Expressions.Target);
    const inline = target?.findDirectExpression(Expressions.InlineData);
    if (inline) {
      if (byteMode) {
        InlineData.runSyntax(inline, input, XStringType.get());
      } else {
        InlineData.runSyntax(inline, input, StringType.get());
      }
    } else if (target) {
      const type = Target.runSyntax(target, input);
      const compatible = byteMode ? new TypeUtils(input.scope).isHexLike(type) : new TypeUtils(input.scope).isCharLikeStrict(type);
      if (compatible === false) {
        const message = "Target type not compatible";
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      }
    }

    if (linesMode) {
      for (const s of node.findDirectExpressions(Expressions.Source)) {
        const type = Source.runSyntax(s, input);
        if (!(type instanceof UnknownType) && !(type instanceof VoidType) && !(type instanceof TableType)) {
          const message = "Source must be an internal table";
          input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
          return;
        }
      }
    }

    for (const s of node.findDirectExpressions(Expressions.SimpleSource3)) {
      const type = Source.runSyntax(s, input);
      const compatible = byteMode ? new TypeUtils(input.scope).isHexLike(type) : new TypeUtils(input.scope).isCharLikeStrict(type);
      if (compatible === false) {
        const message = "Source type not compatible";
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      }
    }

  }
}