import {seq, alt, Expression, str, tok} from "../combi";
import * as Expressions from ".";
import {ParenLeft, ParenRightW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

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

}