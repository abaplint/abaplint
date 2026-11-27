import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {VoidType} from "../../types/basic";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";
import {InlineData} from "../expressions/inline_data";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput} from "../_syntax_input";

// Statements whose operands need resolution but no statement-specific type inference.
export class SourceTarget implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
    // A PROVIDE condition uses components of the source table as operands.
    const operands = node.findAllExpressionsMulti([Expressions.Source, Expressions.SimpleSource3, Expressions.Target, Expressions.Cond]);
    for (const expression of operands) {
      if (expression.get() instanceof Expressions.Target) {
        const inline = expression.findDirectExpression(Expressions.InlineData);
        if (inline) {
          InlineData.runSyntax(inline, input, VoidType.get(node.get().constructor.name));
        } else {
          Target.runSyntax(expression, input);
        }
      } else if (!(expression.get() instanceof Expressions.Cond)) {
        Source.runSyntax(expression, input);
      }
    }
  }
}
