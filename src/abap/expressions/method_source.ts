import {seq, alt, opt, tok, Expression, IStatementRunnable} from "../combi";
import {InstanceArrow, StaticArrow} from "../tokens/";
import {MethodName, Dynamic, FieldChain, MethodCallChain} from "../expressions";

export class MethodSource extends Expression {
  public getRunnable(): IStatementRunnable {
    const mname = alt(new MethodName(), new Dynamic());
    const cname = alt(new FieldChain(), new MethodCallChain(), new Dynamic());

    return seq(opt(seq(cname, alt(tok(InstanceArrow), tok(StaticArrow)))), mname);
  }
}