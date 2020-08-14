import {seq, opt, tok, alt, str, star, Expression, altPrio} from "../combi";
import {WParenLeftW, WParenRightW, WParenLeft, ParenRightW} from "../../1_lexer/tokens";
import {Compare} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class Cond extends Expression {
  public getRunnable(): IStatementRunnable {
    const operator = altPrio(str("AND"), str("OR"), str("EQUIV"));

    // rule ParserMissingSpace makes sure the whitespace is correct
    const another = seq(opt(str("NOT")),
                        altPrio(tok(WParenLeftW), tok(WParenLeft)),
                        new Cond(),
                        altPrio(tok(WParenRightW), tok(ParenRightW)));

    const cnd = alt(new Compare(), another);

    const ret = seq(cnd, star(seq(operator, cnd)));

    return ret;
  }
}