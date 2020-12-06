import {seqs, stars, tok, regex as reg, Expression} from "../combi";
import {Dash} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class MacroName extends Expression {
  public getRunnable(): IStatementRunnable {
    const r = /^(\/\w+\/)?[\w\*%\?$&]+>?$/;
    return seqs(reg(r), stars(seqs(tok(Dash), reg(r))));
  }
}