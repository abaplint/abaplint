import {str, alt, seq, optPrio, star, tok, Reuse, IRunnable} from "../combi";
import {WParenLeftW, WParenRightW, WParenRight} from "../tokens/";
import {SQLCompare} from "./";

export class SQLCond extends Reuse {
  public get_runnable(): IRunnable {
    let operator = alt(str("AND"), str("OR"));

    let paren = seq(tok(WParenLeftW),
                    new SQLCond(),
                    alt(tok(WParenRightW), tok(WParenRight)));

    let cnd = seq(optPrio(str("NOT")), alt(new SQLCompare(), paren));

    let ret = seq(cnd, star(seq(operator, cnd)));

    return ret;
  }
}