import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {Source} from "../expressions/source";
import {StatementSyntax} from "../_statement_syntax";
import {MethodSource} from "../expressions/method_source";
import {SyntaxInput} from "../_syntax_input";

export class SetHandler implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      Source.runSyntax(s, input);
    }

    for (const s of node.findDirectExpressions(Expressions.MethodSource)) {
      MethodSource.runSyntax(s, input);
    }

  }
}