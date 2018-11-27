import {seq, opt, tok, regex as reg, Expression, IStatementRunnable} from "../combi";
import {WDash} from "../tokens/";

export class Integer extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(opt(tok(WDash)), reg(/^\d+$/));
  }
}