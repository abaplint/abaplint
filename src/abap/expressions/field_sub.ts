import {seq, star, tok, regex as reg, Expression, IStatementRunnable} from "../combi";
import {Dash} from "../tokens/";

export class FieldSub extends Expression {
  public getRunnable(): IStatementRunnable {
    const ret = seq(reg(/^!?(\/\w+\/)?[\w%\$\*]+$/),
                    star(seq(tok(Dash), reg(/^[\w%\$\*]+$/))));

    return ret;
  }
}