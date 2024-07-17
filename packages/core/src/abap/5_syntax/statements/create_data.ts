import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {Target} from "../expressions/target";
import {Source} from "../expressions/source";
import {Dynamic} from "../expressions/dynamic";
import {StatementSyntax} from "../_statement_syntax";
import {BasicTypes} from "../basic_types";
import {UnknownType} from "../../types/basic";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {ReferenceType} from "../_reference";
import {SyntaxInput} from "../_syntax_input";

export class CreateData implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      new Source().runSyntax(s, input);
    }

    for (const t of node.findDirectExpressions(Expressions.Target)) {
      new Target().runSyntax(t, input);
    }

    for (const t of node.findDirectExpressions(Expressions.Dynamic)) {
      new Dynamic().runSyntax(t, input);
    }

    const type = node.findDirectExpression(Expressions.TypeName);
    if (type) {
      const found = new BasicTypes(input.filename, input.scope).resolveTypeName(type);
      if (found instanceof UnknownType) {
        if (node.concatTokens().toUpperCase().includes(" REF TO ")) {
          const def = input.scope.findObjectDefinition(type.concatTokens());
          if (def) {
            input.scope.addReference(type.getFirstToken(), def, ReferenceType.TypeReference, input.filename);
          } else {
            const identifier = new TypedIdentifier(type.getFirstToken(), input.filename, found);
            input.scope.addReference(type.getFirstToken(), identifier, ReferenceType.TypeReference, input.filename);
          }
        } else {
          const identifier = new TypedIdentifier(type.getFirstToken(), input.filename, found);
          input.scope.addReference(type.getFirstToken(), identifier, ReferenceType.TypeReference, input.filename);
        }
      }
    }

  }
}