import {seq, opt, tok, alt, regex as reg, Expression, IStatementRunnable} from "../combi";
import {WDash, WPlus, WDashW} from "../tokens/";

export class Integer extends Expression {
  public getRunnable(): IStatementRunnable {
    const modifier = opt(alt(tok(WDash), tok(WDashW), tok(WPlus)));
    return seq(modifier, reg(/^\d+$/));
  }
}