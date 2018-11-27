import {seq, str, alt, Expression, IStatementRunnable} from "../combi";
import {Source} from "./";

export class Value extends Expression {
  public getRunnable(): IStatementRunnable {
    const ret = seq(str("VALUE"), alt(new Source(), str("IS INITIAL")));
    return ret;
  }
}