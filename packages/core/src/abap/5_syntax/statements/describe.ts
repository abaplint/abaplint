import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {InlineData} from "../expressions/inline_data";
import {CharacterType, IntegerType} from "../../types/basic";
import {Target} from "../expressions/target";
import {Source} from "../expressions/source";
import {FieldChain} from "../expressions/field_chain";
import {ReferenceType} from "../_reference";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput} from "../_syntax_input";

export class Describe implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {

    for (const s of node.findAllExpressions(Expressions.Source)) {
      new Source().runSyntax(s, input);
    }
    for (const s of node.findAllExpressions(Expressions.FieldChain)) {
      new FieldChain().runSyntax(s, input, ReferenceType.DataReadReference);
    }

    const linesTarget = node.findExpressionAfterToken("LINES");
    if (linesTarget?.get() instanceof Expressions.Target) {
      const inline = linesTarget?.findDirectExpression(Expressions.InlineData);
      if (inline) {
        new InlineData().runSyntax(inline, input, IntegerType.get());
      } else {
        new Target().runSyntax(linesTarget, input);
      }
    }

    const typeTarget = node.findExpressionAfterToken("TYPE");
    if (typeTarget?.get() instanceof Expressions.Target) {
      const inline = typeTarget?.findDirectExpression(Expressions.InlineData);
      if (inline) {
        new InlineData().runSyntax(inline, input, new CharacterType(1));
      } else {
        new Target().runSyntax(typeTarget, input);
      }
    }

    const lengthTarget = node.findExpressionAfterToken("LENGTH");
    if (lengthTarget?.get() instanceof Expressions.Target) {
      const inline = lengthTarget?.findDirectExpression(Expressions.InlineData);
      if (inline) {
        new InlineData().runSyntax(inline, input, IntegerType.get());
      } else {
        new Target().runSyntax(lengthTarget, input);
      }
    }

    const componentsTarget = node.findExpressionAfterToken("COMPONENTS");
    if (componentsTarget?.get() instanceof Expressions.Target) {
      const inline = componentsTarget?.findDirectExpression(Expressions.InlineData);
      if (inline) {
        new InlineData().runSyntax(inline, input, IntegerType.get());
      } else {
        new Target().runSyntax(componentsTarget, input);
      }
    }

  }
}