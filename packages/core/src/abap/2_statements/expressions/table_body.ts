import {seqs, tok, Expression} from "../combi";
import {BracketLeft, BracketRightW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class TableBody extends Expression {
  public getRunnable(): IStatementRunnable {
    const ret = seqs(tok(BracketLeft), tok(BracketRightW));
    return ret;
  }
}