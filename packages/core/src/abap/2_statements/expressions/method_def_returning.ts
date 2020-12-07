import {seq, Expression, tok} from "../combi";
import * as Expressions from ".";
import {ParenLeft, ParenRightW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class MethodDefReturning extends Expression {
  public getRunnable(): IStatementRunnable {
    const value = seq("VALUE",
                      tok(ParenLeft),
                      Expressions.MethodParamName,
                      tok(ParenRightW));

    return seq("RETURNING", value, Expressions.TypeParam);
  }
}