import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode, StatementNode, TokenNode} from "../../nodes";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";
import {AbstractType} from "../../types/basic/_abstract_type";
import {TableType} from "../../types/basic";
import {TypeUtils} from "../_type_utils";

export class Replace implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
    const byteMode = node.findDirectTokenByText("BYTE") !== undefined;
    const regex = node.findDirectExpression(Expressions.FindType)?.concatTokens().toUpperCase();
    const isRegex = regex === "REGEX" || regex === "PCRE";

    // operands which must be character like, or byte like in BYTE MODE
    const checks: {node: ExpressionNode, type: AbstractType | undefined, table: boolean}[] = [];

    let previous: string | undefined = undefined;
    let first = true;
    for (const child of node.getChildren()) {
      if (child instanceof TokenNode) {
        previous = child.concatTokens().toUpperCase();
        continue;
      } else if (child.get() instanceof Expressions.FindType) {
        previous = child.concatTokens() === "" ? previous : "FINDTYPE";
        continue;
      }

      if (child.get() instanceof Expressions.Source) {
        const type = Source.runSyntax(child, input);
        if (previous === "WITH"
            || (first === true && previous === "REPLACE")
            || ((previous === "OF" || previous === "FINDTYPE") && isRegex === false)) {
          checks.push({node: child, type, table: false});
        }
      } else if (child.get() instanceof Expressions.Target) {
        const type = Target.runSyntax(child, input);
        if (previous === "IN" || previous === "OF" || previous === "INTO") {
          checks.push({node: child, type, table: false});
        } else if (previous === "TABLE") {
          checks.push({node: child, type, table: true});
        }
      }
      first = false;
    }

    const utils = new TypeUtils(input.scope);
    for (const check of checks) {
      let type = check.type;
      if (check.table === true) {
        if (!(type instanceof TableType)) {
          continue;
        }
        type = type.getRowType();
      }
      if (type === undefined) {
        continue;
      }
      const ok = byteMode ? utils.isHexLike(type) : utils.isCharLikeStrict(type);
      if (ok === false) {
        const kind = byteMode ? "byte like" : "character like";
        const message = check.table === true
          ? "REPLACE, table row type must be " + kind
          : "REPLACE, \"" + check.node.concatTokens() + "\" must be " + kind;
        input.issues.push(syntaxIssue(input, check.node.getFirstToken(), message));
        return;
      }
    }
  }
}
