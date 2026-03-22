import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {Source} from "../expressions/source";
import {FieldChain} from "../expressions/field_chain";
import {ReferenceType} from "../_reference";
import {StatementSyntax} from "../_statement_syntax";
import {Version} from "../../../version";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";
import {FunctionParameters} from "../expressions/function_parameters";

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

    for (const s of node.findDirectExpressions(Expressions.SimpleSource2)) {
      Source.runSyntax(s, input);
    }
    for (const s of node.findDirectExpressions(Expressions.Source)) {
      Source.runSyntax(s, input);
    }

    const fp = node.findDirectExpression(Expressions.FunctionParameters);
    if (fp) {
      FunctionParameters.runSyntax(fp, input);
    }
  }
}