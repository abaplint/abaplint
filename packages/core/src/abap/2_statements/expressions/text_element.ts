import {Expression, seq, str, tok} from "../combi";
import {Dash} from "../../1_lexer/tokens";
import {TextElementKey} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class TextElement extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(str("TEXT"), tok(Dash), new TextElementKey());
  }
}