import {seq, tok, regex as reg, Expression, IStatementRunnable, optPrio, altPrio} from "../combi";
import {WDash, WPlus, WDashW} from "../../1_lexer/tokens";

export class Integer extends Expression {
  public getRunnable(): IStatementRunnable {
    const modifier = optPrio(altPrio(tok(WDash), tok(WDashW), tok(WPlus)));
    return seq(modifier, reg(/^\d+$/));
  }
}