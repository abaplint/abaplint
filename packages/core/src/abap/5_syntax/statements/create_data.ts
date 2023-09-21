import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Target} from "../expressions/target";
import {Source} from "../expressions/source";
import {Dynamic} from "../expressions/dynamic";
import {StatementSyntax} from "../_statement_syntax";
import {BasicTypes} from "../basic_types";
import {UnknownType} from "../../types/basic";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {ReferenceType} from "../_reference";

export class CreateData implements StatementSyntax {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      new Source().runSyntax(s, scope, filename);
    }

    for (const t of node.findDirectExpressions(Expressions.Target)) {
      new Target().runSyntax(t, scope, filename);
    }

    for (const t of node.findDirectExpressions(Expressions.Dynamic)) {
      new Dynamic().runSyntax(t, scope, filename);
    }

    const type = node.findDirectExpression(Expressions.TypeName);
    if (type) {
      const found = new BasicTypes(filename, scope).resolveTypeName(type);
      if (found instanceof UnknownType) {
        if (node.concatTokens().toUpperCase().includes(" REF TO ")) {
          const def = scope.findObjectDefinition(type.concatTokens());
          if (def) {
            scope.addReference(type.getFirstToken(), def, ReferenceType.TypeReference, filename);
          } else {
            const identifier = new TypedIdentifier(type.getFirstToken(), filename, found);
            scope.addReference(type.getFirstToken(), identifier, ReferenceType.TypeReference, filename);
          }
        } else {
          const identifier = new TypedIdentifier(type.getFirstToken(), filename, found);
          scope.addReference(type.getFirstToken(), identifier, ReferenceType.TypeReference, filename);
        }
      }
    }

  }
}