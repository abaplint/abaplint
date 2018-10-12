import {seq, star, tok, regex as reg, Expression, IRunnable} from "../combi";
import {Dash} from "../tokens/";

export class MacroName extends Expression {
  public getRunnable(): IRunnable {
    return seq(reg(/^[\w%][\w\*]*>?$/), star(seq(tok(Dash), reg(/^\w+$/))));
  }
}