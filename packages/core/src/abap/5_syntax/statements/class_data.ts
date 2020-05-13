import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {DataDefinition} from "../expressions/data_definition";
import {UnknownType} from "../../types/basic/unknown_type";

export class ClassData {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): TypedIdentifier | undefined {
    const dd = node.findFirstExpression(Expressions.DataDefinition);
    if (dd) {
      return new DataDefinition().runSyntax(dd, scope, filename);
    }

    const fallback = node.findFirstExpression(Expressions.NamespaceSimpleName);
    if (fallback) {
      return new TypedIdentifier(fallback.getFirstToken(), filename, new UnknownType("class data, fallback"));
    }

    return undefined;
  }
}