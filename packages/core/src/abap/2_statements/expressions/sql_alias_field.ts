import {Dash} from "../../1_lexer/tokens";
import {regex as reg, Expression, seq, starPrio, tok} from "../combi";
import {IStatementRunnable} from "../statement_runnable";

export class SQLAliasField extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(reg(/^(\/\w+\/)?\w+~(\/\w+\/)?\w+$/), starPrio(seq(tok(Dash), reg(/^\w+$/))));
  }
}