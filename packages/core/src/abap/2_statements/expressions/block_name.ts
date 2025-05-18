import {seq, starPrio, tok, regex as reg, Expression, optPrio} from "../combi";
import {Dash, WDash} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class BlockName extends Expression {
  public getRunnable(): IStatementRunnable {
    const ret = seq(optPrio(tok(WDash)), reg(/^[\w%\$\*]+$/), starPrio(seq(tok(Dash), reg(/^[\w%\$\*]+$/))));

    return ret;
  }
}