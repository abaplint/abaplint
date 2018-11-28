import {seq, opt, tok, alt, regex as reg, Expression, IStatementRunnable} from "../combi";
import {WDash, WPlus} from "../tokens/";

export class Integer extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(opt(alt(tok(WDash), tok(WPlus))), reg(/^\d+$/));
  }
}