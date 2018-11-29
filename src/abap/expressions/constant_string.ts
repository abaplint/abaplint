import {seq, opt, tok, regex as reg, Expression, IStatementRunnable} from "../combi";
import {ParenLeft, ParenRightW} from "../tokens/";

export class ConstantString extends Expression {
  public getRunnable(): IStatementRunnable {
    const text = seq(tok(ParenLeft), reg(/^\w{3}$/), tok(ParenRightW));
    /*
    let constant = reg(/^('.*')|(`.*`)$/);
    let concat = seq(str("&"), constant);
    let stri = seq(constant, star(concat), opt(text));
    */
    const stri = seq(reg(/^('.*')|(`.*`)$/), opt(text));
    return stri;
  }
}