import {seq, opt, tok, alt, str, star, Expression, altPrio} from "../combi";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {Compare} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class Cond extends Expression {
  public getRunnable(): IStatementRunnable {
    const operator = altPrio(str("AND"), str("OR"), str("EQUIV"));

    const another = seq(opt(str("NOT")),
                        tok(WParenLeftW),
                        new Cond(),
                        tok(WParenRightW));

    const cnd = alt(new Compare(), another);

    const ret = seq(cnd, star(seq(operator, cnd)));

    return ret;
  }
}