import {seqs, opts, tok, alts, star, Expression} from "../combi";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {ComponentCompare} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class ComponentCond extends Expression {
  public getRunnable(): IStatementRunnable {
    const operator = alts("AND", "OR");

    const another = seqs(opts("NOT"),
                         tok(WParenLeftW),
                         ComponentCond,
                         tok(WParenRightW));

    const cnd = alts(ComponentCompare, another);

    const ret = seqs(cnd, star(seqs(operator, cnd)));

    return ret;
  }
}