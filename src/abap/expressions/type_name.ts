import {seq, alt, opt, tok, regex as reg, Expression, IStatementRunnable} from "../combi";
import {StaticArrow, Dash, InstanceArrow} from "../tokens/";

export class TypeName extends Expression {

  public getRunnable(): IStatementRunnable {
    const name = reg(/^[\w~\/%]+$/);
    const cla = seq(name, alt(tok(StaticArrow), tok(InstanceArrow)));
    const field = seq(tok(Dash), name);
    return seq(opt(cla), name, opt(field));
  }

}