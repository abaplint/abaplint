import {seq, tok, regex as reg, Expression, optPrio} from "../combi";
import {Dash} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class IncludeName extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(reg(/^<?(\/\w+\/)?[\w%]+(~\w+)?>?$/), optPrio(seq(tok(Dash), reg(/^\w+$/))));
  }
}