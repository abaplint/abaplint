import {ExpressionNode} from "../../nodes";
import * as Expressions from "../../2_statements/expressions";
import {Source} from "./source";
import {Target} from "./target";
import {SyntaxInput} from "../_syntax_input";

export class ReduceNext {
  public static runSyntax(node: ExpressionNode | undefined, input: SyntaxInput): void {
    if (node === undefined) {
      return;
    }

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      Source.runSyntax(s, input);
    }

    for (const s of node.findDirectExpressions(Expressions.SimpleTarget)) {
      Target.runSyntax(s, input);
    }
  }
}