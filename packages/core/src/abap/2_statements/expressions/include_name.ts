import {seqs, tok, regex as reg, Expression, optPrios} from "../combi";
import {Dash} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class IncludeName extends Expression {
  public getRunnable(): IStatementRunnable {
    return seqs(reg(/^<?(\/\w+\/)?[\w%]+(~\w+)?>?$/), optPrios(seqs(tok(Dash), reg(/^\w+$/))));
  }
}