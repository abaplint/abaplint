import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";
import {FieldChain} from "../expressions/field_chain";
import {ReferenceType} from "../_reference";
import {StatementSyntax} from "../_statement_syntax";
import {Version} from "../../../version";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";

export class CallFunction implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
    // todo, lots of work here, similar to receive.ts

    const name = node.findFirstExpression(Expressions.FunctionName);
    const chain = name?.findFirstExpression(Expressions.FieldChain);
    if (chain) {
      FieldChain.runSyntax(chain, input, ReferenceType.DataReadReference);
    } else if (input.scope.getVersion() === Version.Cloud
        && node.findDirectExpression(Expressions.Destination) === undefined) {
      const functionName = name?.concatTokens().replace(/'/g, "");
      if (input.scope.findFunctionModule(functionName) === undefined) {
        const message = `Function module "${functionName}" not found/released`;
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      }
    }

    // just recurse
    for (const s of node.findAllExpressions(Expressions.Source)) {
      Source.runSyntax(s, input);
    }
    for (const s of node.findAllExpressions(Expressions.SimpleSource3)) {
      Source.runSyntax(s, input);
    }
    for (const t of node.findAllExpressions(Expressions.Target)) {
      Target.runSyntax(t, input);
    }
    for (const s of node.findDirectExpressions(Expressions.SimpleSource2)) {
      Source.runSyntax(s, input);
    }

    const exceptions = node.findFirstExpression(Expressions.ParameterException);
    for (const s of exceptions?.findAllExpressions(Expressions.SimpleFieldChain) || []) {
      FieldChain.runSyntax(s, input, ReferenceType.DataReadReference);
    }
  }
}