import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";
import {StatementSyntax} from "../_statement_syntax";
import {InlineData} from "../expressions/inline_data";
import {AnyType, DataReference} from "../../types/basic";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";

export class GetReference implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
    const s = node.findDirectExpression(Expressions.Source);
    const type = Source.runSyntax(s, input);

    const target = node.findDirectExpression(Expressions.Target);
    const inline = target?.findDirectExpression(Expressions.InlineData);
// todo: error if inline field symbol
    if (inline) {
      if (type instanceof AnyType) {
        const message = "GET REFERENCE generic and inline declaration not possible";
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      }
      InlineData.runSyntax(inline, input, type ? new DataReference(type) : undefined);
    } else if (target) {
      Target.runSyntax(target, input);
    }
  }
}