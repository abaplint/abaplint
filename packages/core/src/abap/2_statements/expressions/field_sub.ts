import {seqs, starPrio, tok, regex as reg, Expression} from "../combi";
import {Dash} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class FieldSub extends Expression {
  public getRunnable(): IStatementRunnable {
    const ret = seqs(reg(/^!?(\/\w+\/)?[a-zA-Z_%$][\w%$\$\*]*$/),
                     starPrio(seqs(tok(Dash), reg(/^[\w%$\$\*]+$/))));

    return ret;
  }
}