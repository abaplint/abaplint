import {seq, starPrios, tok, regex as reg, Expression} from "../combi";
import {Dash} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class BlockName extends Expression {
  public getRunnable(): IStatementRunnable {
    const ret = seq(reg(/^[\w%\$\*]+$/), starPrios(seq(tok(Dash), reg(/^[\w%\$\*]+$/))));

    return ret;
  }
}