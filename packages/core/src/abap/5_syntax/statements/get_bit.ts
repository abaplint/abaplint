import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";
import {StatementSyntax} from "../_statement_syntax";
import {IntegerType} from "../../types/basic";
import {InlineData} from "../expressions/inline_data";
import {AbstractType} from "../../types/basic/_abstract_type";
import {TypeUtils} from "../_type_utils";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";

export class GetBit implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {

    let lastType: AbstractType | undefined = undefined;
    for (const s of node.findDirectExpressions(Expressions.Source)) {
      lastType = Source.runSyntax(s, input);
    }

    if (lastType && new TypeUtils(input.scope).isHexLike(lastType) === false) {
      const message = "Input must be byte-like";
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return;
    }

    for (const t of node.findDirectExpressions(Expressions.Target)) {
      const inline = t?.findDirectExpression(Expressions.InlineData);
      if (inline) {
        InlineData.runSyntax(t, input, IntegerType.get());
      } else {
        Target.runSyntax(t, input);
      }
    }

  }
}