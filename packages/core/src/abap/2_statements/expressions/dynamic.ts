import {seq, altPrio, tok, Expression} from "../combi";
import {WParenLeft, ParenLeft, ParenRightW, ParenRight} from "../../1_lexer/tokens";
import {FieldChain, Constant} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class Dynamic extends Expression {
  public getRunnable(): IStatementRunnable {
    const ret = seq(altPrio(tok(WParenLeft), tok(ParenLeft)),
                    altPrio(FieldChain, Constant),
                    altPrio(tok(ParenRightW), tok(ParenRight)));

    return ret;
  }
}