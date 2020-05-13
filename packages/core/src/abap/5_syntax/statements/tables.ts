import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {UnknownType} from "../../types/basic";

export class Tables {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): TypedIdentifier | undefined {
    const nameToken = node.findFirstExpression(Expressions.Field)?.getFirstToken();
    if (nameToken === undefined) {
      return undefined;
    }

    const found = scope.getDDIC()?.lookupTable(nameToken.getStr());
    if (found) {
      return new TypedIdentifier(nameToken, filename, found);
    }

    return new TypedIdentifier(nameToken, filename, new UnknownType("Tables, fallback"));
  }
}