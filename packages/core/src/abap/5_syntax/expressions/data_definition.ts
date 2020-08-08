import {ExpressionNode} from "../../nodes";
import * as Expressions from "../../2_statements/expressions";
import {CurrentScope} from "../_current_scope";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {UnknownType} from "../../types/basic";
import {BasicTypes} from "../basic_types";
import {TypeTable} from "./type_table";

export class DataDefinition {
  public runSyntax(node: ExpressionNode, scope: CurrentScope, filename: string): TypedIdentifier | undefined {
    const tt = node.findFirstExpression(Expressions.TypeTable);
    if (tt) {
      return new TypeTable().runSyntax(node, scope, filename);
    }

    const bfound = new BasicTypes(filename, scope).simpleType(node);
    if (bfound) {
      return bfound;
    }

    const name = node.findFirstExpression(Expressions.DefinitionName);
    if (name) {
      return new TypedIdentifier(name.getFirstToken(), filename, new UnknownType("DataDefinition, fallback"));
    }

    return undefined;
  }
}