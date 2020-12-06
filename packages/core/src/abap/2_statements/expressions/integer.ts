import {seq, tok, regex as reg, Expression, optPrios, altPrio} from "../combi";
import {WDash, WPlus, WDashW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class Integer extends Expression {
  public getRunnable(): IStatementRunnable {
    const modifier = optPrios(altPrio(tok(WDash), tok(WDashW), tok(WPlus)));
    return seq(modifier, reg(/^\d+$/));
  }
}