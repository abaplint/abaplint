import {seq, str, alt, Expression, IStatementRunnable} from "../combi";
import {Constant} from "./";
import {FieldChain} from "./field_chain";

export class Value extends Expression {
  public getRunnable(): IStatementRunnable {
    const ret = seq(str("VALUE"), alt(new Constant(), new FieldChain(), str("IS INITIAL")));
    return ret;
  }
}