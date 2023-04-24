import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {TypedIdentifier, IdentifierMeta} from "../../types/_typed_identifier";
import {UnknownType} from "../../types/basic";
import {BasicTypes} from "../basic_types";
import * as Expressions from "../../2_statements/expressions";
import {Default} from "./default";
import {CGenericType} from "../../types/basic/cgeneric_type";

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

    const def = type.findDirectExpression(Expressions.Default);
    if (def) {
      try {
        new Default().runSyntax(def, scope, filename);
      } catch (e) {
        return new TypedIdentifier(name.getFirstToken(), filename, new UnknownType(e.toString()), meta);
      }
    }

    const concat = type.concatTokens().toUpperCase();
    if (concat === "TYPE C" || concat.startsWith("TYPE C ")) {
      return new TypedIdentifier(name.getFirstToken(), filename, new CGenericType(), meta);
    }

    const found = new BasicTypes(filename, scope).parseType(type);
    if (found) {
      return new TypedIdentifier(name.getFirstToken(), filename, found, meta);
    } else {
      return new TypedIdentifier(name.getFirstToken(), filename, new UnknownType("method param, todo"), meta);
    }
  }
}