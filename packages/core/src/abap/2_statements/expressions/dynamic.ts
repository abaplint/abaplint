import {seq, alt, tok, Expression} from "../combi";
import {WParenLeft, ParenLeft, ParenRightW, ParenRight} from "../../1_lexer/tokens";
import {FieldChain, Constant} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class Dynamic extends Expression {
  public getRunnable(): IStatementRunnable {
    const ret = seq(alt(tok(WParenLeft), tok(ParenLeft)),
                    alt(FieldChain, Constant),
                    alt(tok(ParenRightW), tok(ParenRight)));

    return ret;
  }
}