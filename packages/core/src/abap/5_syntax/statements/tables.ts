import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {StatementSyntax} from "../_statement_syntax";
import {UnknownType} from "../../types/basic/unknown_type";

export class Tables implements StatementSyntax {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {
    const nameToken = node.findFirstExpression(Expressions.Field)?.getFirstToken();
    if (nameToken === undefined) {
      return undefined;
    }

    let name = nameToken.getStr();
    if (name.startsWith("*")) {
      name = name.substr(1);
    }

    // lookupTableOrView will also give Unknown and Void
    const found = scope.getDDIC()?.lookupTableOrView(name);
    if (found) {
      scope.getDDICReferences().addUsing(scope.getParentObj(), {object: found.object, filename: filename, token: nameToken});
      scope.addIdentifier(new TypedIdentifier(nameToken, filename, found.type));
      return;
    }

    // this should never happen,
    scope.addIdentifier(new TypedIdentifier(nameToken, filename, new UnknownType("Tables, fallback")));
  }
}