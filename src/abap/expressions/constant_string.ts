import {seq, opt, tok, alt, regex as reg, Expression, IRunnable} from "../combi";
import {ParenLeft, ParenRightW, ParenRight} from "../tokens/";

export class ConstantString extends Expression {
  public get_runnable(): IRunnable {
    let text = seq(tok(ParenLeft), reg(/^\w{3}$/), alt(tok(ParenRightW), tok(ParenRight)));
    /*
    let constant = reg(/^('.*')|(`.*`)$/);
    let concat = seq(str("&"), constant);
    let stri = seq(constant, star(concat), opt(text));
    */
    let stri = seq(reg(/^('.*')|(`.*`)$/), opt(text));
    return stri;
  }
}