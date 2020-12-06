import {seq, opts, tok, alts, stars, Expression} from "../combi";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {ComponentCompare} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class ComponentCond extends Expression {
  public getRunnable(): IStatementRunnable {
    const operator = alts("AND", "OR");

    const another = seq(opts("NOT"),
                        tok(WParenLeftW),
                        ComponentCond,
                        tok(WParenRightW));

    const cnd = alts(ComponentCompare, another);

    const ret = seq(cnd, stars(seq(operator, cnd)));

    return ret;
  }
}