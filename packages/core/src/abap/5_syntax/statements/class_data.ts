import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {IdentifierMeta, TypedIdentifier} from "../../types/_typed_identifier";
import {DataDefinition} from "../expressions/data_definition";
import {UnknownType} from "../../types/basic/unknown_type";

export class ClassData {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): TypedIdentifier | undefined {
    const dd = node.findFirstExpression(Expressions.DataDefinition);
    if (dd) {
      const found = new DataDefinition().runSyntax(dd, scope, filename);
      if (found === undefined) {
        return undefined;
      }
      const meta = found.getMeta().slice();
      meta.push(IdentifierMeta.Static);
      return new TypedIdentifier(found.getToken(), filename, found.getType(), meta);
    }

    const fallback = node.findFirstExpression(Expressions.NamespaceSimpleName);
    if (fallback) {
      return new TypedIdentifier(fallback.getFirstToken(), filename, new UnknownType("class data, fallback"));
    }

    return undefined;
  }
}