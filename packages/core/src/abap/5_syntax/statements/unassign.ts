import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {StatementSyntax} from "../_statement_syntax";
import {ReferenceType} from "../_reference";
import {SyntaxInput} from "../_syntax_input";

export class Unassign implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
    const target = node?.findDirectExpression(Expressions.TargetFieldSymbol);
    if (target) {
      const token = target.getFirstToken();
      const found = input.scope.findVariable(token.getStr());
      if (found === undefined) {
        throw new Error(`"${token.getStr()}" not found, Unassign`);
      }
      input.scope.addReference(token, found, ReferenceType.DataWriteReference, input.filename);
    }
  }
}