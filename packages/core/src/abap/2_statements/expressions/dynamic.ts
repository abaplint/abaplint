import {seqs, alt, tok, Expression} from "../combi";
import {WParenLeft, ParenLeft, ParenRightW, ParenRight} from "../../1_lexer/tokens";
import {FieldChain, Constant} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class Dynamic extends Expression {
  public getRunnable(): IStatementRunnable {
    const ret = seqs(alt(tok(WParenLeft), tok(ParenLeft)),
                     alt(new FieldChain(), new Constant()),
                     alt(tok(ParenRightW), tok(ParenRight)));

    return ret;
  }
}