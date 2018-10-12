import {seq, star, tok, regex as reg, Expression, IRunnable} from "../combi";
import {Dash} from "../tokens/";

export class FieldSub extends Expression {
  public getRunnable(): IRunnable {
    let ret = seq(reg(/^(\/\w+\/)?[\w%\$\*]+$/),
                  star(seq(tok(Dash), reg(/^[\w%\$\*]+$/))));

    return ret;
  }
}