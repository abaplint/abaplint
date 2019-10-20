import {seq, alt, str, Expression, IStatementRunnable} from "../combi";
import {Integer} from "./integer";
import {NamespaceSimpleName} from "./namespace_simple_name";

export class Length extends Expression {
  public getRunnable(): IStatementRunnable {
    // must be integer or constant
    const ret = seq(str("LENGTH"), alt(new Integer(), new NamespaceSimpleName()));
    return ret;
  }
}