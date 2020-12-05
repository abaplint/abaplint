import {seqs, star, tok, regex as reg, Expression} from "../combi";
import {Dash} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class ReportName extends Expression {
  public getRunnable(): IStatementRunnable {
    return seqs(reg(/^[\w/$%]+$/), star(seqs(tok(Dash), reg(/^\w+$/))));
  }
}