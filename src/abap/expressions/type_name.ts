import {seq, alt, str, opt, tok, regex as reg, Expression, IRunnable} from "../combi";
import {Arrow, Dash} from "../tokens/";

export class TypeName extends Expression {
  public getRunnable(): IRunnable {
    const name = reg(/^(\/\w+\/)?%?[\w~]+$/);
    const cla = seq(name, tok(Arrow));
    const field = seq(tok(Dash), name);
    return alt(seq(opt(cla), name, opt(field)), str("#"));
  }
}