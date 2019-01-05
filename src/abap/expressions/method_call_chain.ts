import {seq, opt, str, tok, plus, ver, star, alt, Expression, IStatementRunnable} from "../combi";
import {InstanceArrow, StaticArrow, WParenRightW, WParenRight, ParenLeftW, WParenLeftW} from "../tokens/";
import {ParameterListS, ArrowOrDash, Field, FieldChain, MethodCall, Source, TypeName} from "./";
import {Version} from "../../version";
import {ClassName} from "./class_name";

export class MethodCallChain extends Expression {
  public getRunnable(): IStatementRunnable {
    const fields = star(seq(new ArrowOrDash(), new Field()));
    const after = star(seq(fields, tok(InstanceArrow), new MethodCall()));

    const rparen = alt(tok(WParenRightW), tok(WParenRight));

    const lines = plus(seq(tok(WParenLeftW), new Source(), tok(WParenRightW)));

    const neww = ver(Version.v740sp02, seq(str("NEW"),
                                           new TypeName(),
                                           tok(ParenLeftW),
                                           opt(alt(new Source(), new ParameterListS(), lines)),
                                           rparen));

    const cast = ver(Version.v740sp02, seq(str("CAST"),
                                           new TypeName(),
                                           tok(ParenLeftW),
                                           new Source(),
                                           rparen));

    const localVariable = seq(new FieldChain(), tok(InstanceArrow));
    const staticClass = seq(new ClassName(), tok(StaticArrow));

    const ret = seq(alt(seq(opt(alt(localVariable, staticClass)), new MethodCall()),
                        neww,
                        cast),
                    after);

    return ret;
  }
}