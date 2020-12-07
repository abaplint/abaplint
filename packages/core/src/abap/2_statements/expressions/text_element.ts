import {Expression, seq, tok} from "../combi";
import {Dash} from "../../1_lexer/tokens";
import {TextElementKey} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class TextElement extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq("TEXT", tok(Dash), TextElementKey);
  }
}