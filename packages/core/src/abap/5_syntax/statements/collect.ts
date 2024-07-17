import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {Source} from "../expressions/source";
import {FSTarget} from "../expressions/fstarget";
import {Target} from "../expressions/target";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput} from "../_syntax_input";

export class Collect implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
    const source = node.findDirectExpression(Expressions.Source);
    if (source) {
      new Source().runSyntax(source, input);
    }

    const target = node.findDirectExpression(Expressions.Target);
    if (target) {
      new Target().runSyntax(target, input);
    }

    const fs = node.findDirectExpression(Expressions.FSTarget);
    if (fs) {
      new FSTarget().runSyntax(fs, input, undefined);
    }
  }
}