import {seq, tok, regex as reg, Expression, starPrio} from "../combi";
import {Dash} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class MacroName extends Expression {
  public getRunnable(): IStatementRunnable {
    const r = /^(\/\w+\/)?[\w\*%\?$&]+>?$/;
    return seq(reg(r), starPrio(seq(tok(Dash), reg(r))));
  }
}