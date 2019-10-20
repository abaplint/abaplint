import {seq, tok, regex as reg, Expression, IStatementRunnable} from "../combi";
import {ParenLeft, ParenRightW} from "../tokens";

export class TextElementString extends Expression {
  public getRunnable(): IStatementRunnable {
    const text = seq(tok(ParenLeft), reg(/^\w{3}$/), tok(ParenRightW));
    const stri = seq(reg(/^('.*')|(`.*`)$/), text);
    return stri;
  }
}