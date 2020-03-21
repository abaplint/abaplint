import {seq, tok, Expression, IStatementRunnable} from "../combi";
import {BracketLeft, BracketRightW} from "../../1_lexer/tokens";

export class TableBody extends Expression {
  public getRunnable(): IStatementRunnable {
    const ret = seq(tok(BracketLeft), tok(BracketRightW));
    return ret;
  }
}