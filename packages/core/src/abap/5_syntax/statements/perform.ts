import * as Expressions from "../../2_statements/expressions";
import * as Statements from "../../2_statements/statements";
import {StatementNode} from "../../nodes";
import {ReferenceType} from "../_reference";
import {Source} from "../expressions/source";
import {StatementSyntax} from "../_statement_syntax";
import {Target} from "../expressions/target";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";
import {AssertError} from "../assert_error";
import {Dynamic} from "../expressions/dynamic";

export class Perform implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
    if (!(node.get() instanceof Statements.Perform)) {
      throw new AssertError("checkPerform unexpected node type");
    }

    ////////////////////////////
    // check parameters are defined

    for (const c of node.findDirectExpressions(Expressions.PerformChanging)) {
      for (const s of c.findDirectExpressions(Expressions.Target)) {
        Target.runSyntax(s, input);
      }
    }
    for (const t of node.findDirectExpressions(Expressions.PerformTables)) {
      for (const s of t.findDirectExpressions(Expressions.Source)) {
        Source.runSyntax(s, input);
      }
    }
    for (const u of node.findDirectExpressions(Expressions.PerformUsing)) {
      for (const s of u.findDirectExpressions(Expressions.Source)) {
        Source.runSyntax(s, input);
      }
    }

    ////////////////////////////
    // find FORM definition

    if (node.findFirstExpression(Expressions.IncludeName)) {
      return; // in external program, not checked, todo
    }

    const dynamic = node.findFirstExpression(Expressions.Dynamic);
    if (dynamic) {
      Dynamic.runSyntax(dynamic, input);
      return; // todo, maybe some parts can be checked
    }

    const expr = node.findFirstExpression(Expressions.FormName);
    if (expr === undefined) {
      return; // it might be a dynamic call
    }

    const name = expr.concatTokens();

    const found = input.scope.findFormDefinition(name);
    if (found === undefined) {
      const message = "FORM definition \"" + name + "\" not found";
      input.issues.push(syntaxIssue(input, expr.getFirstToken(), message));
      return;
    }

    input.scope.addReference(expr.getFirstToken(), found, ReferenceType.FormReference, input.filename);

    // todo, also check parameters match
  }
}