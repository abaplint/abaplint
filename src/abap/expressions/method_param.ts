import {seq, alt, Expression, str, tok, IStatementRunnable} from "../combi";
import * as Expressions from "./";
import {ParenLeft, ParenRightW} from "../tokens/";
import {ExpressionNode} from "../nodes";
import {CurrentScope} from "../syntax/_current_scope";
import {TypedIdentifier} from "../types/_typed_identifier";
import {UnknownType} from "../types/basic";

export class MethodParam extends Expression {
  public getRunnable(): IStatementRunnable {
    const ref = seq(str("REFERENCE"),
                    tok(ParenLeft),
                    new Expressions.MethodParamName(),
                    tok(ParenRightW));

    const value = seq(str("VALUE"),
                      tok(ParenLeft),
                      new Expressions.MethodParamName(),
                      tok(ParenRightW));

    const fieldsOrValue = seq(alt(value,
                                  ref,
                                  new Expressions.MethodParamName()),
                              new Expressions.TypeParam());

    return fieldsOrValue;
  }

  public runSyntax(node: ExpressionNode, _scope: CurrentScope, filename: string): TypedIdentifier {
    const name = node.findFirstExpression(Expressions.MethodParamName);
    if (!name) {
      throw new Error("method_parameter.ts, todo, handle pass by value and reference");
    }

    return new TypedIdentifier(name.getFirstToken(), filename, new UnknownType("method param, todo"));
  }

}