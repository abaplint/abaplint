import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import * as Expressions from "../../2_statements/expressions";
import {Source} from "./source";

export class SwitchBody {
  public runSyntax(node: ExpressionNode | undefined, scope: CurrentScope, filename: string) {
    if (node === undefined) {
      return;
    }

    const thenSource = node.findExpressionAfterToken("THEN");
    if (!(thenSource?.get() instanceof Expressions.Source)) {
      throw new Error("SwitchBody, unexpected");
    }
    const type = new Source().runSyntax(thenSource, scope, filename);

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      if (s === thenSource) {
        continue;
      }
      new Source().runSyntax(s, scope, filename);
    }

    return type;
  }
}