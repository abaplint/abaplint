import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";
import {FieldChain} from "../expressions/field_chain";
import {ReferenceType} from "../_reference";

export class CallFunction {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {
    // todo, lots of work here, similar to receive.ts

    const name = node.findFirstExpression(Expressions.FunctionName);
    const chain = name?.findFirstExpression(Expressions.FieldChain);
    if (chain) {
      new FieldChain().runSyntax(chain, scope, filename, ReferenceType.DataReadReference);
    }

    // just recurse
    for (const s of node.findAllExpressions(Expressions.Source)) {
      new Source().runSyntax(s, scope, filename);
    }
    for (const t of node.findAllExpressions(Expressions.Target)) {
      new Target().runSyntax(t, scope, filename);
    }
    for (const s of node.findDirectExpressions(Expressions.BasicSource)) {
      new Source().runSyntax(s, scope, filename);
    }
  }
}