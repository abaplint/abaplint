import {seq, opt, tok, alt, str, star, Expression, IStatementRunnable} from "../combi";
import {WParenLeftW, WParenRightW} from "../tokens/";
import {ComponentCompare} from "./";

export class ComponentCond extends Expression {
  public getRunnable(): IStatementRunnable {
    const operator = alt(str("AND"), str("OR"));

    const another = seq(opt(str("NOT")),
                        tok(WParenLeftW),
                        new ComponentCond(),
                        tok(WParenRightW));

    const cnd = alt(new ComponentCompare(), another);

    const ret = seq(cnd, star(seq(operator, cnd)));

    return ret;
  }
}