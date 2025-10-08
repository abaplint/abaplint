import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {VoidType} from "../../types/basic";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput} from "../_syntax_input";

export class FieldGroup implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
    const nameExpression = node.findFirstExpression(Expressions.Field);
    if (nameExpression === undefined) {
      return;
    }
    const name = nameExpression?.concatTokens();
    if (name === undefined) {
      return;
    }
    const id = new TypedIdentifier(nameExpression?.getFirstToken(), input.filename, VoidType.get("FIELD-GROUP"));
    input.scope.addIdentifier(id);
  }
}