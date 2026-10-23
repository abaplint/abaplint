import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {InlineData} from "../expressions/inline_data";
import {CharacterType, IntegerType, StringType} from "../../types/basic";
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

    const children = node.getChildren();
    for (const target of node.findDirectExpressions(Expressions.Target)) {
      const inline = target.findDirectExpression(Expressions.InlineData);
      if (inline) {
        const keyword = children[children.indexOf(target) - 1]?.concatTokens().toUpperCase();
        const type = keyword === "TYPE" || keyword === "KIND" ? new CharacterType(1)
          : keyword === "ID" || keyword === "MASK" ? StringType.get() : IntegerType.get();
        InlineData.runSyntax(inline, input, type);
      } else {
        Target.runSyntax(target, input);
      }
    }

  }
}
