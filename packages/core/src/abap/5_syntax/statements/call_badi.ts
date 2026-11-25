import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";
import {Dynamic} from "../expressions/dynamic";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput} from "../_syntax_input";
import {DataReference} from "../../types/basic";

export class CallBadi implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {

    for (const s of node.findAllExpressions(Expressions.Source)) {
      if (Source.runSyntax(s, input) instanceof DataReference) {
        input.referenceMayChange?.(s, input.scope, false, "referent");
      }
    }

    for (const t of node.findAllExpressions(Expressions.Target)) {
      Target.runSyntax(t, input);
      input.referenceMayChange?.(t, input.scope, true, "write");
    }

    for (const d of node.findAllExpressions(Expressions.Dynamic)) {
      Dynamic.runSyntax(d, input);
    }
    input.referenceMayChange?.(undefined, input.scope, false, "routine");

  }
}
