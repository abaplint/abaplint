import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {StatementSyntax} from "../_statement_syntax";
import {ReferenceType} from "../_reference";

export class Unassign implements StatementSyntax {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {
    const target = node?.findDirectExpression(Expressions.TargetFieldSymbol);
    if (target) {
      const token = target.getFirstToken();
      const found = scope.findVariable(token.getStr());
      if (found === undefined) {
        throw new Error(`"${token.getStr()}" not found, Unassign`);
      }
      scope.addReference(token, found, ReferenceType.DataWriteReference, filename);
    }
  }
}