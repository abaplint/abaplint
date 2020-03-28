import {seq, tok, Expression} from "../combi";
import {BracketLeft, BracketRightW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class TableBody extends Expression {
  public getRunnable(): IStatementRunnable {
    const ret = seq(tok(BracketLeft), tok(BracketRightW));
    return ret;
  }
}