import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {Source} from "../expressions/source";
import {ReferenceType} from "../_reference";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput} from "../_syntax_input";

export class RaiseEvent implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
// todo: only possible in classes

    const f = node.findDirectExpression(Expressions.EventName);
    if (f?.concatTokens().includes("~")) {
      const name = f.concatTokens().split("~")[0];
      const idef = input.scope.findInterfaceDefinition(name);
      if (idef) {
        input.scope.addReference(f.getFirstToken(), idef, ReferenceType.ObjectOrientedReference, input.filename);
      }
    }

    for (const s of node.findAllExpressions(Expressions.Source)) {
      Source.runSyntax(s, input);
    }

  }
}