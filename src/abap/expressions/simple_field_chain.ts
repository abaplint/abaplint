import {seq, alt, star, tok, Expression, IStatementRunnable} from "../combi";
import {ClassName, Field, ComponentName} from "./";
import {StaticArrow, Dash} from "../tokens";

export class SimpleFieldChain extends Expression {
  public getRunnable(): IStatementRunnable {
    const chain = star(seq(tok(Dash), new ComponentName()));

    const clas = seq(new ClassName(), tok(StaticArrow), new ComponentName());
    const start = alt(clas, new Field());

    const ret = seq(start, chain);

    return ret;
  }
}