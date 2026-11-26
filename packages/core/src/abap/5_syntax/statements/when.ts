import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode, StatementNode} from "../../nodes";
import {Source} from "../expressions/source";
import {Compare} from "../expressions/compare";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";
import {TypeUtils} from "../_type_utils";
import {BuiltIn} from "../_builtin";
import {BuiltInCall} from "../_builtin_call";
import {checkCaseOperand} from "./case";

export class When implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {

    // the values the CASE operand is compared with, "WHEN a OR b"
    const values = [...node.findDirectExpressions(Expressions.Source),
      ...node.findDirectExpressions(Expressions.Or).map(o => o.findDirectExpression(Expressions.Source))];
    const typeUtils = new TypeUtils(input.scope);
    const calculated: ExpressionNode[] = [];

    for (const s of node.findAllExpressions(Expressions.Source)) {
      const type = Source.runSyntax(s, input);
      if (values.includes(s) === false) {
        continue;
      }

      const message = this.checkCalculation(s, input);
      if (message !== undefined) {
        calculated.push(s);
        input.issues.push(syntaxIssue(input, s.getFirstToken(), message));
      } else if (typeUtils.hasComparisonType(input.caseOperand?.type, type) === false) {
        input.issues.push(syntaxIssue(input, s.getFirstToken(), "Incompatible types for comparison"));
      }
    }
    for (const s of node.findDirectExpressions(Expressions.Source)) {
      if (calculated.includes(s) === false) {
        checkCaseOperand(s, input);
      }
    }

  }

  // a value after WHEN cannot be calculated, unlike the operand of CASE: no arithmetic expression, and of the
  // numeric built-in functions only those with one unnamed argument, which is a data object
  private checkCalculation(source: ExpressionNode, input: SyntaxInput): string | undefined {
    if (Compare.isArithmetic(source, input)) {
      return "Arithmetic expression not allowed after WHEN";
    }

    const call = BuiltInCall.fromSource(source, input);
    if (call === undefined || BuiltInCall.isNumeric(call) === false) {
      return undefined;
    }
    const name = BuiltInCall.callName(call);
    if (BuiltIn.hasUnnamedArgument(name) && BuiltInCall.hasDataObjectArgument(call)) {
      return undefined;
    }
    return `Built-in function "${name}" not allowed after WHEN, only a function of a data object`;
  }
}
