import {Expression, seqs, tok} from "../combi";
import {Dash} from "../../1_lexer/tokens";
import {TextElementKey} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class TextElement extends Expression {
  public getRunnable(): IStatementRunnable {
    return seqs("TEXT", tok(Dash), TextElementKey);
  }
}