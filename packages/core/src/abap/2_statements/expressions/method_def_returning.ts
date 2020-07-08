import {seq, Expression, str, tok} from "../combi";
import * as Expressions from ".";
import {ParenLeft, ParenRightW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class MethodDefReturning extends Expression {
  public getRunnable(): IStatementRunnable {
    const value = seq(str("VALUE"),
                      tok(ParenLeft),
                      new Expressions.MethodParamName(),
                      tok(ParenRightW));

    return seq(str("RETURNING"), value, new Expressions.TypeParam());
  }
}