import {seq, star, tok, Expression, altPrio} from "../combi";
import {ParenRightW, WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {ComponentCond} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class ComponentCondSub extends Expression {
  public getRunnable(): IStatementRunnable {

    const another = seq(star("NOT"),
                        tok(WParenLeftW),
                        ComponentCond,
                        altPrio(tok(WParenRightW), tok(ParenRightW)));

    return another;
  }
}