import {seq, opt, tok, alt, star, Expression} from "../combi";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {ComponentCompare} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class ComponentCond extends Expression {
  public getRunnable(): IStatementRunnable {
    const operator = alt("AND", "OR");

    const another = seq(opt("NOT"),
                        tok(WParenLeftW),
                        ComponentCond,
                        tok(WParenRightW));

    const cnd = alt(ComponentCompare, another);

    const ret = seq(cnd, star(seq(operator, cnd)));

    return ret;
  }
}