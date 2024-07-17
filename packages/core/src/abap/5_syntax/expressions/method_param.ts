import {ExpressionNode} from "../../nodes";
import {TypedIdentifier, IdentifierMeta} from "../../types/_typed_identifier";
import {UnknownType, XGenericType} from "../../types/basic";
import {BasicTypes} from "../basic_types";
import * as Expressions from "../../2_statements/expressions";
import {Default} from "./default";
import {CGenericType} from "../../types/basic/cgeneric_type";
import {SyntaxInput} from "../_syntax_input";
import {AssertError} from "../assert_error";

export class MethodParam {
  public runSyntax(node: ExpressionNode, input: SyntaxInput, meta: IdentifierMeta[]): TypedIdentifier {
    const name = node.findDirectExpression(Expressions.MethodParamName);
    if (name === undefined) {
      throw new AssertError("MethodParam, todo, handle pass by value and reference");
    }

    const type = node.findDirectExpression(Expressions.TypeParam);
    if (type === undefined) {
      throw new AssertError("MethodParam, unexpected structure");
    }

    const def = type.findDirectExpression(Expressions.Default);
    if (def) {
      try {
        new Default().runSyntax(def, input);
      } catch (e) {
        return new TypedIdentifier(name.getFirstToken(), input.filename, new UnknownType(e.toString()), meta);
      }
    }

    const concat = type.concatTokens().toUpperCase();
    if (concat === "TYPE C" || concat.startsWith("TYPE C ")) {
      return new TypedIdentifier(name.getFirstToken(), input.filename, new CGenericType(), meta);
    } else if (concat === "TYPE X" || concat.startsWith("TYPE X ")) {
      return new TypedIdentifier(name.getFirstToken(), input.filename, new XGenericType(), meta);
    }

    const found = new BasicTypes(input).parseType(type);
    if (found) {
      return new TypedIdentifier(name.getFirstToken(), input.filename, found, meta);
    } else {
      return new TypedIdentifier(name.getFirstToken(), input.filename, new UnknownType("method param, todo"), meta);
    }
  }
}