import {seq, opt, tok, alt, str, star, Expression} from "../combi";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {ComponentCompare} from ".";
import {IStatementRunnable} from "../statement_runnable";

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