import {CurrentScope} from "../_current_scope";
import {StatementNode} from "../../nodes";
import {BasicTypes} from "../basic_types";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {UnknownType} from "../../types/basic";
import * as Expressions from "../../2_statements/expressions";
import {TypeTable} from "../expressions/type_table";

export class Type {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string, qualifiedNamePrefix?: string): TypedIdentifier | undefined {
    const tt = node.findFirstExpression(Expressions.TypeTable);
    if (tt) {
      return new TypeTable().runSyntax(node, scope, filename, qualifiedNamePrefix);
    }

    const found = new BasicTypes(filename, scope).simpleType(node, qualifiedNamePrefix);
    if (found) {
      if (found?.getType().isGeneric() === true
          && found?.getType().containsVoid() === false) {
        throw new Error("TYPES definition cannot be generic, " + found.getName());
      }
      return found;
    }

    const fallback = node.findFirstExpression(Expressions.NamespaceSimpleName);
    if (fallback) {
      return new TypedIdentifier(fallback.getFirstToken(), filename, new UnknownType("Type, fallback"));
    }

    return undefined;
  }
}