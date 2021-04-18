import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {UnknownType} from "../../types/basic";
import {StatementSyntax} from "../_statement_syntax";

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

    const found = scope.getDDIC()?.lookupTableOrView(name);
    if (found) {
      scope.addIdentifier(new TypedIdentifier(nameToken, filename, found));
      return;
    }

    scope.addIdentifier(new TypedIdentifier(nameToken, filename, new UnknownType("Tables, fallback")));
  }
}