import {seqs, tok, regex as reg, Expression, optPrio, altPrios} from "../combi";
import {WDash, WPlus, WDashW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class Integer extends Expression {
  public getRunnable(): IStatementRunnable {
    const modifier = optPrio(altPrios(tok(WDash), tok(WDashW), tok(WPlus)));
    return seqs(modifier, reg(/^\d+$/));
  }
}