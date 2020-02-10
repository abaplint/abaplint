import {seq, tok, star, alt, Expression, IStatementRunnable, optPrio, altPrio} from "../combi";
import {InstanceArrow, StaticArrow} from "../tokens/";
import {ClassName, NewObject, ArrowOrDash, ComponentName, FieldChain, MethodCall, Cast} from "./";

export class MethodCallChain extends Expression {
  public getRunnable(): IStatementRunnable {
    const fields = star(seq(new ArrowOrDash(), new ComponentName()));
    const after = star(seq(fields, tok(InstanceArrow), new MethodCall()));

    const localVariable = seq(new FieldChain(), tok(InstanceArrow));
    const staticClass = seq(new ClassName(), tok(StaticArrow));

    const ret = seq(alt(seq(optPrio(altPrio(localVariable, staticClass)), new MethodCall()),
                        new NewObject(),
                        new Cast()),
                    after);

    return ret;
  }
}