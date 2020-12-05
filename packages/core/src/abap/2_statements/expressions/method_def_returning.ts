import {seqs, Expression, tok} from "../combi";
import * as Expressions from ".";
import {ParenLeft, ParenRightW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class MethodDefReturning extends Expression {
  public getRunnable(): IStatementRunnable {
    const value = seqs("VALUE",
                       tok(ParenLeft),
                       Expressions.MethodParamName,
                       tok(ParenRightW));

    return seqs("RETURNING", value, Expressions.TypeParam);
  }
}