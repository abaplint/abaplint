import {seq, tok, regex as reg, Expression, IStatementRunnable} from "../combi";
import {ParenLeft, ParenRightW} from "../tokens";
import {TextElementKey} from ".";

export class TextElementString extends Expression {
  public getRunnable(): IStatementRunnable {
    const text = seq(tok(ParenLeft), new TextElementKey(), tok(ParenRightW));
    const stri = seq(reg(/^('.*')|(`.*`)$/), text);
    return stri;
  }
}