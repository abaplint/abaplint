import {ExpressionNode} from "../../nodes";
import * as Expressions from "../../2_statements/expressions";
import {TypedIdentifier, IdentifierMeta} from "../../types/_typed_identifier";
import {UnknownType} from "../../types/basic";
import {BasicTypes} from "../basic_types";
import {SyntaxInput} from "../_syntax_input";
import {AssertError} from "../assert_error";

export class MethodDefReturning {
  public runSyntax(node: ExpressionNode, input: SyntaxInput, meta: IdentifierMeta[]): TypedIdentifier {
    const name = node.findDirectExpression(Expressions.MethodParamName);
    if (name === undefined) {
      throw new AssertError("method_parameter.ts, todo, handle pass by value and reference");
    }

    const type = node.findDirectExpression(Expressions.TypeParam);
    if (type === undefined) {
      throw new AssertError("method_parameter.ts, unexpected structure");
    }

    let found = new BasicTypes(input).parseType(type);

    if (found?.isGeneric() === true) {
      found = new UnknownType("RETURNING parameter must be fully specified");
    }

    if (found) {
      return new TypedIdentifier(name.getFirstToken(), input.filename, found, meta);
    } else {
      return new TypedIdentifier(name.getFirstToken(), input.filename, new UnknownType("method param, todo"), meta);
    }
  }
}