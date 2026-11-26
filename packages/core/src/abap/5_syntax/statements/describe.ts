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

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      Source.runSyntax(s, input);
    }
    for (const s of node.findDirectExpressions(Expressions.FieldChain)) {
      FieldChain.runSyntax(s, input, ReferenceType.DataReadReference);
    }

    for (const addition of ["LINES", "KIND", "OCCURS"]) {
      const target = node.findExpressionAfterToken(addition);
      if (target?.get() instanceof Expressions.Target) {
        const inline = target.findDirectExpression(Expressions.InlineData);
        if (inline) {
          InlineData.runSyntax(inline, input, addition === "KIND" ? new CharacterType(1) : IntegerType.get());
        } else {
          Target.runSyntax(target, input);
        }
      }
    }

    const typeTarget = node.findExpressionAfterToken("TYPE");
    if (typeTarget?.get() instanceof Expressions.Target) {
      const inline = typeTarget?.findDirectExpression(Expressions.InlineData);
      if (inline) {
        InlineData.runSyntax(inline, input, new CharacterType(1));
      } else {
        Target.runSyntax(typeTarget, input);
      }
    }

    const lengthTarget = node.findExpressionAfterToken("LENGTH");
    if (lengthTarget?.get() instanceof Expressions.Target) {
      const inline = lengthTarget?.findDirectExpression(Expressions.InlineData);
      if (inline) {
        InlineData.runSyntax(inline, input, IntegerType.get());
      } else {
        Target.runSyntax(lengthTarget, input);
      }
    }

    const componentsTarget = node.findExpressionAfterToken("COMPONENTS");
    if (componentsTarget?.get() instanceof Expressions.Target) {
      const inline = componentsTarget?.findDirectExpression(Expressions.InlineData);
      if (inline) {
        InlineData.runSyntax(inline, input, IntegerType.get());
      } else {
        Target.runSyntax(componentsTarget, input);
      }
    }

  }
}
