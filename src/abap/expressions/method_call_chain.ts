import {seq, opt, str, tok, ver, star, alt, Expression, IStatementRunnable} from "../combi";
import {InstanceArrow, StaticArrow, WParenRightW, WParenRight, ParenLeftW} from "../tokens/";
import {ParameterListS, ArrowOrDash, Field, FieldChain, MethodCall, Source, TypeName} from "./";
import {Version} from "../../version";

export class MethodCallChain extends Expression {
  public getRunnable(): IStatementRunnable {
    const fields = star(seq(new ArrowOrDash(), new Field()));
    const after = star(seq(fields, tok(InstanceArrow), new MethodCall()));

    const rparen = alt(tok(WParenRightW), tok(WParenRight));

    const neww = ver(Version.v740sp02, seq(str("NEW"),
                                           new TypeName(),
                                           tok(ParenLeftW),
                                           opt(alt(new Source(), new ParameterListS())),
                                           rparen));

    const cast = ver(Version.v740sp02, seq(str("CAST"),
                                           new TypeName(),
                                           tok(ParenLeftW),
                                           new Source(),
                                           rparen));

    const ret = seq(alt(seq(opt(seq(new FieldChain(), alt(tok(InstanceArrow), tok(StaticArrow)))), new MethodCall()),
                        neww,
                        cast),
                    after);

    return ret;
  }
}