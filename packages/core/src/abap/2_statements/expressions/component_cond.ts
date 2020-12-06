import {seqs, opt, tok, alts, str, star, Expression} from "../combi";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {ComponentCompare} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class ComponentCond extends Expression {
  public getRunnable(): IStatementRunnable {
    const operator = alts("AND", "OR");

    const another = seqs(opt(str("NOT")),
                         tok(WParenLeftW),
                         ComponentCond,
                         tok(WParenRightW));

    const cnd = alts(ComponentCompare, another);

    const ret = seqs(cnd, star(seqs(operator, cnd)));

    return ret;
  }
}