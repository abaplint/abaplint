import {seq, alt, str, opt, tok, regex as reg, Expression, IStatementRunnable} from "../combi";
import {Arrow, Dash} from "../tokens/";

export class TypeName extends Expression {
  public getRunnable(): IStatementRunnable {
    const name = reg(/^[\w~\/%]+$/);
    const cla = seq(name, tok(Arrow));
    const field = seq(tok(Dash), name);
    return alt(seq(opt(cla), name, opt(field)), str("#"));
  }
}