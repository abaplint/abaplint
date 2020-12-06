import {seqs, alts, tok, Expression} from "../combi";
import {WParenLeft, ParenLeft, ParenRightW, ParenRight} from "../../1_lexer/tokens";
import {FieldChain, Constant} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class Dynamic extends Expression {
  public getRunnable(): IStatementRunnable {
    const ret = seqs(alts(tok(WParenLeft), tok(ParenLeft)),
                     alts(FieldChain, Constant),
                     alts(tok(ParenRightW), tok(ParenRight)));

    return ret;
  }
}