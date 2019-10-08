import {Expression, IStatementRunnable, seq, str, tok, regex as reg} from "../combi";
import {Dash} from "../tokens";

export class TextElement extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(str("TEXT"), tok(Dash), reg(/^\d\d\d$/));
  }
}