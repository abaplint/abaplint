import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import * as Expressions from "../../2_statements/expressions";
import {TypedIdentifier, IdentifierMeta} from "../../types/_typed_identifier";
import {UnknownType} from "../../types/basic";
import {BasicTypes} from "../basic_types";

export class MethodDefReturning {
  public runSyntax(node: ExpressionNode, scope: CurrentScope, filename: string, meta: IdentifierMeta[]): TypedIdentifier {
    const name = node.findDirectExpression(Expressions.MethodParamName);
    if (name === undefined) {
      throw new Error("method_parameter.ts, todo, handle pass by value and reference");
    }

    const type = node.findDirectExpression(Expressions.TypeParam);
    if (type === undefined) {
      throw new Error("method_parameter.ts, unexpected structure");
    }

    let found = new BasicTypes(filename, scope).parseType(type);

    if (found?.isGeneric() === true) {
      found = new UnknownType("RETURNING parameter must be fully specified");
    }

    if (found) {
      return new TypedIdentifier(name.getFirstToken(), filename, found, meta);
    } else {
      return new TypedIdentifier(name.getFirstToken(), filename, new UnknownType("method param, todo"), meta);
    }
  }
}