import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {InlineData} from "../expressions/inline_data";
import {CharacterType, IntegerType} from "../../types/basic";
import {Target} from "../expressions/target";
import {Source} from "../expressions/source";
import {FieldChain} from "../expressions/field_chain";
import {ReferenceType} from "../_reference";
import {StatementSyntax} from "../_statement_syntax";

export class Describe implements StatementSyntax {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {

    for (const s of node.findAllExpressions(Expressions.Source)) {
      new Source().runSyntax(s, scope, filename);
    }
    for (const s of node.findAllExpressions(Expressions.FieldChain)) {
      new FieldChain().runSyntax(s, scope, filename, ReferenceType.DataReadReference);
    }

    const linesTarget = node.findExpressionAfterToken("LINES");
    if (linesTarget?.get() instanceof Expressions.Target) {
      const inline = linesTarget?.findDirectExpression(Expressions.InlineData);
      if (inline) {
        new InlineData().runSyntax(inline, scope, filename, new IntegerType());
      } else {
        new Target().runSyntax(linesTarget, scope, filename);
      }
    }

    const typeTarget = node.findExpressionAfterToken("TYPE");
    if (typeTarget?.get() instanceof Expressions.Target) {
      const inline = linesTarget?.findDirectExpression(Expressions.InlineData);
      if (inline) {
        new InlineData().runSyntax(inline, scope, filename, new CharacterType(1));
      } else {
        new Target().runSyntax(typeTarget, scope, filename);
      }
    }

    const lengthTarget = node.findExpressionAfterToken("LENGTH");
    if (lengthTarget?.get() instanceof Expressions.Target) {
      const inline = linesTarget?.findDirectExpression(Expressions.InlineData);
      if (inline) {
        new InlineData().runSyntax(inline, scope, filename, new IntegerType());
      } else {
        new Target().runSyntax(lengthTarget, scope, filename);
      }
    }

  }
}