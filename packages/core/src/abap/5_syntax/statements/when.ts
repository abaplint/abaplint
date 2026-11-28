import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {Source} from "../expressions/source";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";
import {TypeUtils} from "../_type_utils";
import {checkCaseOperand} from "./case";

export class When implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {

    // the values the CASE operand is compared with, "WHEN a OR b"
    const values = [...node.findDirectExpressions(Expressions.Source),
      ...node.findDirectExpressions(Expressions.Or).map(o => o.findDirectExpression(Expressions.Source))];
    const typeUtils = new TypeUtils(input.scope);

    for (const s of node.findAllExpressions(Expressions.Source)) {
      const type = Source.runSyntax(s, input);
      if (values.includes(s) && typeUtils.hasComparisonType(input.caseOperand?.type, type) === false) {
        input.issues.push(syntaxIssue(input, s.getFirstToken(), "Incompatible types for comparison"));
      }
    }
    for (const s of node.findDirectExpressions(Expressions.Source)) {
      checkCaseOperand(s, input);
    }

  }
}
