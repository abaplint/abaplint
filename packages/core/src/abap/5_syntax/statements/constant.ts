import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {BasicTypes} from "../basic_types";
import {TypedIdentifier, IdentifierMeta} from "../../types/_typed_identifier";
import {UnknownType} from "../../types/basic";

export class Constant {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): TypedIdentifier {
    const basic = new BasicTypes(filename, scope);
    const found = basic.simpleType(node);
    if (found) {
      const val = basic.findValue(node);
      const meta = [IdentifierMeta.ReadOnly, IdentifierMeta.Static];
      if (val !== undefined) {
        return new TypedIdentifier(found.getToken(), filename, found.getType(), meta, val);
      } else {
        return new TypedIdentifier(found.getToken(), filename, new UnknownType("todo, TypedConstantIdentifier"), meta, "unknown");
      }
    }

    const fallback = node.findFirstExpression(Expressions.DefinitionName);
    if (fallback) {
      return new TypedIdentifier(fallback.getFirstToken(), filename, new UnknownType("constant, fallback"));
    }

    throw new Error("Statement Constant: unexpected structure");
  }
}