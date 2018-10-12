import {seq, opt, str, tok, ver, star, alt, Expression, IRunnable} from "../combi";
import {Arrow, WParenRightW, WParenRight, ParenLeftW} from "../tokens/";
import {ParameterListS, ArrowOrDash, Field, FieldChain, MethodCall, Source, TypeName} from "./";
import {Version} from "../../version";

export class MethodCallChain extends Expression {
  public get_runnable(): IRunnable {
    let fields = star(seq(new ArrowOrDash(), new Field()));
    let after = star(seq(fields, tok(Arrow), new MethodCall()));

    let rparen = alt(tok(WParenRightW), tok(WParenRight));

    let neww = ver(Version.v740sp02, seq(str("NEW"),
                                         new TypeName(),
                                         tok(ParenLeftW),
                                         opt(alt(new Source(), new ParameterListS())),
                                         rparen));

    let cast = ver(Version.v740sp02, seq(str("CAST"),
                                         new TypeName(),
                                         tok(ParenLeftW),
                                         new Source(),
                                         rparen));

    let ret = seq(alt(seq(opt(seq(new FieldChain(), tok(Arrow))), new MethodCall()),
                      neww,
                      cast),
                  after);

    return ret;
  }
}