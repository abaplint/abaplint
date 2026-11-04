import * as Expressions from "../../2_statements/expressions";
import * as Statements from "../../2_statements/statements";
import {StatementNode} from "../../nodes";
import {VoidType} from "../../types/basic";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";
import {InlineData} from "../expressions/inline_data";
import {Cond} from "../expressions/cond";
import {ReferenceType} from "../_reference";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput} from "../_syntax_input";

// Statements whose operands need resolution but no statement-specific type inference.
export class SourceTarget implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
    const statement = node.get();
    const communication = statement instanceof Statements.Communication;
    const children = node.getChildren();
    for (const source of node.findAllExpressions(Expressions.Source)) {
      const write = (communication && (source === node.findExpressionAfterToken("RETURNCODE")
        || (source === node.findExpressionAfterToken("BUFFER") && node.findDirectTokenByText("RECEIVE"))
        || (source === node.findExpressionAfterToken("ID")
          && (node.findDirectTokenByText("INIT") || node.findDirectTokenByText("ACCEPT")))))
        || (statement instanceof Statements.GenerateSubroutine && source === node.findExpressionAfterToken("NAME"))
        || (statement instanceof Statements.GetProperty && source === node.findExpressionAfterToken("="));
      Source.runSyntax(source, input, undefined, !!write, false, !write);
    }

    for (const target of node.findDirectExpressions(Expressions.Target)) {
      const index = children.indexOf(target);
      const keyword = children[index - 1]?.concatTokens().toUpperCase();
      const read = statement instanceof Statements.OnChange
        || (statement instanceof Statements.GetDataset && target === node.findDirectExpression(Expressions.Target))
        || (statement instanceof Statements.ReadLine && children[index + 1]?.concatTokens().toUpperCase() === "INTO")
        || (statement instanceof Statements.GenerateReport && (keyword === "ENTRY" || keyword === "FILE"))
        || (communication && (keyword === "DESTINATION" || !!node.findDirectTokenByText("SEND")));
      const inline = target.findDirectExpression(Expressions.InlineData);
      if (inline) {
        InlineData.runSyntax(inline, input, VoidType.get(statement.constructor.name));
      } else {
        Target.runSyntax(target, input, read ? ReferenceType.DataReadReference : ReferenceType.DataWriteReference);
      }
    }

    for (const condition of node.findDirectExpressions(Expressions.Cond)) {
      Cond.runSyntax(condition, input);
    }
  }
}
