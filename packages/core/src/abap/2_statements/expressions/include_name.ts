import {seq, tok, regex as reg, Expression, optPrio, starPrio} from "../combi";
import {Dash} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class IncludeName extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(reg(/^<?(\/\w+\/)?[\w%]+(~\w+)?>?$/), starPrio(seq(tok(Dash), optPrio(reg(/^\w+$/)))));
  }
}