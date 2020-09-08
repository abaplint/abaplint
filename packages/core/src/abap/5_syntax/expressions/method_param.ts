import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {TypedIdentifier, IdentifierMeta} from "../../types/_typed_identifier";
import {UnknownType} from "../../types/basic";
import {BasicTypes} from "../basic_types";
import * as Expressions from "../../2_statements/expressions";

export class MethodParam {
  public runSyntax(node: ExpressionNode, scope: CurrentScope, filename: string, meta: IdentifierMeta[]): TypedIdentifier {
    const name = node.findDirectExpression(Expressions.MethodParamName);
    if (name === undefined) {
      throw new Error("MethodParam, todo, handle pass by value and reference");
    }

    const type = node.findDirectExpression(Expressions.TypeParam);
    if (type === undefined) {
      throw new Error("MethodParam, unexpected structure");
    }

    const found = new BasicTypes(filename, scope).parseType(type);
    if (found) {
      return new TypedIdentifier(name.getFirstToken(), filename, found, meta);
    } else {
      return new TypedIdentifier(name.getFirstToken(), filename, new UnknownType("method param, todo"), meta);
    }
  }
}