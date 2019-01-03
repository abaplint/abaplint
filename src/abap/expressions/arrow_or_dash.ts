import {alt, tok, Expression, IStatementRunnable} from "../combi";
import {InstanceArrow, StaticArrow, Dash} from "../tokens";

export class ArrowOrDash extends Expression {
  public getRunnable(): IStatementRunnable {
    return alt(tok(InstanceArrow), tok(StaticArrow), tok(Dash));
  }
}