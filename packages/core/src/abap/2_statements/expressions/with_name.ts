import {WPlus} from "../../1_lexer/tokens";
import {regex as reg, Expression, tok, seq} from "../combi";
import {IStatementRunnable} from "../statement_runnable";

export class WithName extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(tok(WPlus), reg(/^\w+$/));
  }
}