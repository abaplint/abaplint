import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {Source} from "../expressions/source";
import {StatementSyntax} from "../_statement_syntax";
import {Target} from "../expressions/target";
import {TypeUtils} from "../_type_utils";
import {IntegerType} from "../../types/basic";
import {SyntaxInput} from "../_syntax_input";

export class Do implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {

    const afterDo = node.findExpressionAfterToken("DO");

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      const type = new Source().runSyntax(s, input);
      if (s === afterDo
          && new TypeUtils(input.scope).isAssignable(type, IntegerType.get()) === false) {
        throw new Error("DO TIMES must be numeric");
      }
    }

    for (const t of node.findDirectExpressions(Expressions.Target)) {
      new Target().runSyntax(t, input);
    }
  }
}