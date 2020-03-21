import {Expression, IStatementRunnable, seq, str, tok} from "../combi";
import {Dash} from "../../1_lexer/tokens";
import {TextElementKey} from ".";

export class TextElement extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(str("TEXT"), tok(Dash), new TextElementKey());
  }
}