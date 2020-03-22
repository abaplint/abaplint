import {CurrentScope} from "../../syntax/_current_scope";
import {StatementNode} from "../../nodes";
import {BasicTypes} from "../../syntax/basic_types";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {UnknownType} from "../../types/basic";
import * as Expressions from "../../2_statements/expressions";
import {TypeTable} from "../../syntax/expressions/type_table";

export class Type {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): TypedIdentifier | undefined {
    const tt = node.findFirstExpression(Expressions.TypeTable);
    if (tt) {
      return new TypeTable().runSyntax(node, scope, filename);
    }

    const found = new BasicTypes(filename, scope).simpleType(node);
    if (found) {
      return found;
    }

    const fallback = node.findFirstExpression(Expressions.NamespaceSimpleName);
    if (fallback) {
      return new TypedIdentifier(fallback.getFirstToken(), filename, new UnknownType("Type, fallback"));
    }

    return undefined;
  }
}