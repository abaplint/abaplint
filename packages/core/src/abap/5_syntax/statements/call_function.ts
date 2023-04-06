import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";
import {FieldChain} from "../expressions/field_chain";
import {ReferenceType} from "../_reference";
import {StatementSyntax} from "../_statement_syntax";
import {Version} from "../../../version";

export class CallFunction implements StatementSyntax {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {
    // todo, lots of work here, similar to receive.ts

    const name = node.findFirstExpression(Expressions.FunctionName);
    const chain = name?.findFirstExpression(Expressions.FieldChain);
    if (chain) {
      new FieldChain().runSyntax(chain, scope, filename, ReferenceType.DataReadReference);
    } else if (scope.getVersion() === Version.Cloud
        && node.findDirectExpression(Expressions.Destination) === undefined) {
      const functionName = name?.concatTokens().replace(/'/, "");
      if (scope.findFunctionModule(functionName) === undefined) {
        throw new Error(`Function module "${functionName}" not found/released`);
      }
    }

    // just recurse
    for (const s of node.findAllExpressions(Expressions.Source)) {
      new Source().runSyntax(s, scope, filename);
    }
    for (const s of node.findAllExpressions(Expressions.SimpleSource3)) {
      new Source().runSyntax(s, scope, filename);
    }
    for (const t of node.findAllExpressions(Expressions.Target)) {
      new Target().runSyntax(t, scope, filename);
    }
    for (const s of node.findDirectExpressions(Expressions.SimpleSource2)) {
      new Source().runSyntax(s, scope, filename);
    }
  }
}