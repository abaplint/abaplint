import {seq, Expression, str, tok, IStatementRunnable} from "../combi";
import * as Expressions from ".";
import {ParenLeft, ParenRightW} from "../../1_lexer/tokens";
import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../../syntax/_current_scope";
import {TypedIdentifier, IdentifierMeta} from "../../types/_typed_identifier";
import {UnknownType} from "../../types/basic";
import {BasicTypes} from "../../syntax/basic_types";

export class MethodDefReturning extends Expression  {
  public getRunnable(): IStatementRunnable {
    const value = seq(str("VALUE"),
                      tok(ParenLeft),
                      new Expressions.MethodParamName(),
                      tok(ParenRightW));

    return seq(str("RETURNING"), value, new Expressions.TypeParam());
  }

  public runSyntax(node: ExpressionNode, scope: CurrentScope, filename: string, meta: IdentifierMeta[]): TypedIdentifier {
    const name = node.findDirectExpression(Expressions.MethodParamName);
    if (name === undefined) {
      throw new Error("method_parameter.ts, todo, handle pass by value and reference");
    }

    const type = node.findDirectExpression(Expressions.TypeParam);
    if (type === undefined) {
      throw new Error("method_parameter.ts, unexpected structure");
    }

    const basic = new BasicTypes(filename, scope);

    const found = basic.parseType(type);
    if (found) {
      return new TypedIdentifier(name.getFirstToken(), filename, found, meta);
    } else {
      return new TypedIdentifier(name.getFirstToken(), filename, new UnknownType("method param, todo"), meta);
    }
  }
}