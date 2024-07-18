import {ExpressionNode} from "../../nodes";
import * as Expressions from "../../2_statements/expressions";
import {Source} from "./source";
import {Target} from "./target";
import {SyntaxInput} from "../_syntax_input";

export class ReduceNext {
  public runSyntax(node: ExpressionNode | undefined, input: SyntaxInput): void {
    if (node === undefined) {
      return;
    }

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      new Source().runSyntax(s, input);
    }

    for (const s of node.findDirectExpressions(Expressions.SimpleTarget)) {
      new Target().runSyntax(s, input);
    }
  }
}