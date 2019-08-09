import {seq, opt, tok, star, alt, Expression, IStatementRunnable} from "../combi";
import {InstanceArrow, StaticArrow} from "../tokens/";
import {NewObject, ArrowOrDash, Field, FieldChain, MethodCall, Cast} from "./";
import {ClassName} from "./class_name";

export class MethodCallChain extends Expression {
  public getRunnable(): IStatementRunnable {
    const fields = star(seq(new ArrowOrDash(), new Field()));
    const after = star(seq(fields, tok(InstanceArrow), new MethodCall()));

    const localVariable = seq(new FieldChain(), tok(InstanceArrow));
    const staticClass = seq(new ClassName(), tok(StaticArrow));

    const ret = seq(alt(seq(opt(alt(localVariable, staticClass)), new MethodCall()),
                        new NewObject(),
                        new Cast()),
                    after);

    return ret;
  }
}