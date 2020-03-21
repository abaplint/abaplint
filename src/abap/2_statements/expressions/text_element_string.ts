import {seq, tok, regex as reg, Expression} from "../combi";
import {ParenLeft, ParenRightW} from "../../1_lexer/tokens";
import {TextElementKey} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class TextElementString extends Expression {
  public getRunnable(): IStatementRunnable {
    const text = seq(tok(ParenLeft), new TextElementKey(), tok(ParenRightW));
    const stri = seq(reg(/^('.*')|(`.*`)$/), text);
    return stri;
  }
}