import {seqs, opt, tok, alt, str, star, Expression} from "../combi";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {ComponentCompare} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class ComponentCond extends Expression {
  public getRunnable(): IStatementRunnable {
    const operator = alt(str("AND"), str("OR"));

    const another = seqs(opt(str("NOT")),
                         tok(WParenLeftW),
                         ComponentCond,
                         tok(WParenRightW));

    const cnd = alt(new ComponentCompare(), another);

    const ret = seqs(cnd, star(seqs(operator, cnd)));

    return ret;
  }
}