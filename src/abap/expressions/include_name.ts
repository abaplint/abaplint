import {seq, opt, tok, regex as reg, Expression, IRunnable} from "../combi";
import {Dash} from "../tokens/";

export class IncludeName extends Expression {
  public getRunnable(): IRunnable {
    return seq(reg(/^<?(\/\w+\/)?\w+(~\w+)?>?$/), opt(seq(tok(Dash), reg(/^\w+$/))));
  }
}