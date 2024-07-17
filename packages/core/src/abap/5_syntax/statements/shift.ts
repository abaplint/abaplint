import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {Source} from "../expressions/source";
import {StatementSyntax} from "../_statement_syntax";
import {Target} from "../expressions/target";
import {TypeUtils} from "../_type_utils";
import {SyntaxInput} from "../_syntax_input";

export class Shift implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      new Source().runSyntax(s, input);
    }

    const target = node.findDirectExpression(Expressions.Target);
    if (target === undefined) {
      throw new Error("Shift, Target not found");
    }

    const targetType = new Target().runSyntax(target, input);
    if (node.concatTokens().toUpperCase().includes(" IN BYTE MODE")) {
      if (new TypeUtils(input.scope).isHexLike(targetType) === false) {
        throw new Error("Shift, Target not hex like");
      }
    } else {
      if (new TypeUtils(input.scope).isCharLike(targetType) === false) {
        throw new Error("Shift, Target not char like");
      }
    }

  }
}