import {ExpressionNode} from "../../nodes";
import * as Expressions from "../../2_statements/expressions";
import {Source} from "./source";
import {SyntaxInput} from "../_syntax_input";

export class SwitchBody {
  public runSyntax(node: ExpressionNode | undefined, input: SyntaxInput) {
    if (node === undefined) {
      return;
    }

    const thenSource = node.findExpressionAfterToken("THEN");
    if (!(thenSource?.get() instanceof Expressions.Source)) {
      throw new Error("SwitchBody, unexpected");
    }
    const type = new Source().runSyntax(thenSource, input);

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      if (s === thenSource) {
        continue;
      }
      new Source().runSyntax(s, input);
    }

    return type;
  }
}