import {seq, opt, tok, alt, str, star, Expression, IRunnable} from "../combi";
import {WParenLeftW, WParenRightW, WParenRight} from "../tokens/";
import {Compare} from "./";

export class Cond extends Expression {
  public getRunnable(): IRunnable {
    let operator = alt(str("AND"), str("OR"));

    let another = seq(opt(str("NOT")),
                      tok(WParenLeftW),
                      new Cond(),
                      alt(tok(WParenRightW), tok(WParenRight)));

    let cnd = alt(new Compare(), another);

    let ret = seq(cnd, star(seq(operator, cnd)));

    return ret;
  }
}