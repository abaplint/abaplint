import {alt, tok, Expression, IStatementRunnable} from "../combi";
import {Arrow, Dash} from "../tokens/";

export class ArrowOrDash extends Expression {
  public getRunnable(): IStatementRunnable {
    return alt(tok(Arrow), tok(Dash));
  }
}