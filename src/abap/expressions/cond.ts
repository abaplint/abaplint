import {seq, opt, tok, alt, str, star, Expression, IStatementRunnable} from "../combi";
import {WParenLeftW, WParenRightW} from "../tokens/";
import {Compare} from "./";

export class Cond extends Expression {
  public getRunnable(): IStatementRunnable {
    const operator = alt(str("AND"), str("OR"));

    const another = seq(opt(str("NOT")),
                        tok(WParenLeftW),
                        new Cond(),
                        tok(WParenRightW));

    const cnd = alt(new Compare(), another);

    const ret = seq(cnd, star(seq(operator, cnd)));

    return ret;
  }
}