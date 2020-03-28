import {seq, star, tok, regex as reg, Expression} from "../combi";
import {Dash} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class MacroName extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(reg(/^[\w\*%\?$]+>?$/), star(seq(tok(Dash), reg(/^\w+$/))));
  }
}