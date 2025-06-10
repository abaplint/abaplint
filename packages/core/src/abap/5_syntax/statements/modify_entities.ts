import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";
import {StatementSyntax} from "../_statement_syntax";
import {InlineData} from "../expressions/inline_data";
import {VoidType} from "../../types/basic";
import {SyntaxInput} from "../_syntax_input";

export class ModifyEntities implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      Source.runSyntax(s, input);
    }

    for (const t of node.findDirectExpressions(Expressions.Target)) {
      const inline = t?.findDirectExpression(Expressions.InlineData);
      if (inline) {
        InlineData.runSyntax(inline, input, VoidType.get("ModifyEntities"));
      } else {
        Target.runSyntax(t, input);
      }
    }

  }
}