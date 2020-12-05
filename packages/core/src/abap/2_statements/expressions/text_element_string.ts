import {seqs, tok, regex as reg, Expression} from "../combi";
import {ParenLeft, ParenRightW} from "../../1_lexer/tokens";
import {TextElementKey} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class TextElementString extends Expression {
  public getRunnable(): IStatementRunnable {
    const text = seqs(tok(ParenLeft), TextElementKey, tok(ParenRightW));
    const stri = seqs(reg(/^('.*')|(`.*`)$/), text);
    return stri;
  }
}