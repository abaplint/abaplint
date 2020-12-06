import {regex as reg, seq, tok, Expression} from "../combi";
import {Dash} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class SQLPath extends Expression {
  public getRunnable(): IStatementRunnable {
// todo, only from version?
    const ret = seq(reg(/\\_\w+/), tok(Dash), reg(/\w+/));

    return ret;
  }
}