import {seq, starPrio, tok, regex as reg, Expression, IStatementRunnable} from "../combi";
import {Dash} from "../tokens/";

export class FieldSub extends Expression {
  public getRunnable(): IStatementRunnable {
    const ret = seq(reg(/^!?(\/\w+\/)?[\w%\$\*]+$/),
                    starPrio(seq(tok(Dash), reg(/^[\w%\$\*]+$/))));

    return ret;
  }
}