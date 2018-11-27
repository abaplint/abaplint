import {seq, str, Expression, IStatementRunnable} from "../combi";
import {Source} from "./";

export class Length extends Expression {
  public getRunnable(): IStatementRunnable {
    const ret = seq(str("LENGTH"), new Source());
    return ret;
  }
}