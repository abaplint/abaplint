import {seq, alt, Expression, str, tok, IStatementRunnable} from "../combi";
import * as Expressions from "./";
import {MethodParamName} from "./method_param_name";
import {ParenLeft, ParenRightW} from "../tokens/";
import {ExpressionNode} from "../nodes";
import {Scope} from "../syntax/_scope";
import {TypedIdentifier} from "../types/_typed_identifier";
import {UnknownType} from "../types/basic";

export class MethodParam extends Expression {
  public getRunnable(): IStatementRunnable {
    const ref = seq(str("REFERENCE"),
                    tok(ParenLeft),
                    new MethodParamName(),
                    tok(ParenRightW));

    const value = seq(str("VALUE"),
                      tok(ParenLeft),
                      new MethodParamName(),
                      tok(ParenRightW));

    const fieldsOrValue = seq(alt(value,
                                  ref,
                                  new MethodParamName()),
                              new Expressions.TypeParam());

    return fieldsOrValue;
  }

  public runSyntax(node: ExpressionNode, _scope: Scope, filename: string): TypedIdentifier {
    const name = node.findFirstExpression(Expressions.MethodParamName);
    if (!name) {
      throw new Error("method_parameter.ts, todo, handle pass by value and reference");
    }

    return new TypedIdentifier(name.getFirstToken(), filename, new UnknownType());
  }

}