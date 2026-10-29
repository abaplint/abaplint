import * as Expressions from "../../2_statements/expressions";
import {StatementNode, TokenNode} from "../../nodes";
import {InlineData} from "../expressions/inline_data";
import {TimeType, DateType, PackedType, CharacterType, UTCLongType, NumericType} from "../../types/basic";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput} from "../_syntax_input";

export class Convert implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {

// todo, the source must be of a specific type

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      Source.runSyntax(s, input);
    }

    const children = node.getChildren();
    for (const target of node.findDirectExpressions(Expressions.Target)) {
      const inline = target.findDirectExpression(Expressions.InlineData);
      if (inline) {
        const index = children.indexOf(target);
        const keyword = children[index - 1]?.concatTokens().toUpperCase();
        const daylight = keyword === "TIME" && children[index - 2] instanceof TokenNode
          && children[index - 2].concatTokens().toUpperCase() === "SAVING";
        const inverted = keyword === "DATE" && children[index - 3] instanceof TokenNode
          && children[index - 3].concatTokens().toUpperCase() === "INVERTED";
        const type = daylight ? new CharacterType(1)
          : inverted ? new NumericType(8)
            : keyword === "DATE" ? new DateType()
              : keyword === "STAMP" ? new PackedType(8, 0)
                : keyword === "UTCLONG" ? new UTCLongType() : new TimeType();
        InlineData.runSyntax(inline, input, type);
      } else {
        Target.runSyntax(target, input);
      }
    }

  }
}
