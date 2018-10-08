import {plus, ver, seq, opt, tok, str, alt, star, optPrio, Reuse, IRunnable} from "../combi";
import {Arrow, WParenLeftW, WParenRightW, WParenRight, WDashW, ParenLeftW} from "../tokens/";
import {MethodCallChain, ArithOperator, Cond, Constant, StringTemplate} from "./";
import {FieldChain, Field, TableBody, TypeName, ArrowOrDash, FieldSub, For} from "./";
import {Version} from "../../version";

export class Source extends Reuse {
  public get_runnable(): IRunnable {
    let ref = seq(tok(Arrow), str("*"));

    let method = seq(new MethodCallChain(), optPrio(seq(new ArrowOrDash(), new FieldChain())));

    let rparen = alt(tok(WParenRightW), tok(WParenRight));

// paren used for eg. "( 2 + 1 ) * 4"
    let paren = seq(tok(WParenLeftW),
                    new Source(),
                    rparen);

    let after = seq(alt(str("&"), str("&&"), new ArithOperator()), new Source());

    let bool = seq(alt(ver(Version.v702, str("BOOLC")),
                       ver(Version.v740sp08, str("XSDBOOL"))),
                   tok(ParenLeftW),
                   new Cond(),
                   str(")"));

    let prefix = alt(tok(WDashW), str("BIT-NOT"));

    let old = seq(alt(new Constant(),
                      new StringTemplate(),
                      bool,
                      method,
                      seq(opt(prefix), new FieldChain()),
                      paren),
                  optPrio(alt(ref, after, new TableBody())));

    let mapping = seq(str("MAPPING"), plus(seq(new Field(), str("="), new Field())));

    let baseParen = seq(str("BASE"), tok(WParenLeftW), new Source(), tok(WParenRightW));

    let corr = ver(Version.v740sp05, seq(str("CORRESPONDING"),
                                         new TypeName(),
                                         tok(ParenLeftW),
                                         opt(baseParen),
                                         new Source(),
                                         opt(seq(str("EXCEPT"), new Field())),
                                         opt(mapping),
                                         rparen));

    let arith = seq(new ArithOperator(), new Source());

    let conv = ver(Version.v740sp02, seq(str("CONV"),
                                         new TypeName(),
                                         tok(ParenLeftW),
                                         new Source(),
                                         rparen, opt(arith)));

    let swhen = seq(str("WHEN"), new Source(), str("THEN"), new Source());
    let swit = ver(Version.v740sp02, seq(str("SWITCH"),
                                         new TypeName(),
                                         tok(ParenLeftW),
                                         new Source(),
                                         plus(swhen),
                                         opt(seq(str("ELSE"), new Source())),
                                         rparen));

    let fieldList = seq(new FieldSub(), str("="), new Source());

    let alet = seq(str("LET"), plus(fieldList), str("IN"));

    let base = seq(str("BASE"), new Source());

    let tab = seq(opt(new For()),
                  alt(plus(seq(tok(WParenLeftW), star(new Source()), tok(WParenRightW))),
                      seq(star(fieldList), plus(seq(tok(WParenLeftW), plus(fieldList), tok(WParenRightW))))));

    let strucOrTab = seq(opt(alet), opt(base),
                         alt(plus(fieldList),
                             tab));

    let tabdef = ver(Version.v740sp08, alt(str("OPTIONAL"), seq(str("DEFAULT"), new Source())));

    let value = ver(Version.v740sp02, seq(str("VALUE"),
                                          new TypeName(),
                                          tok(ParenLeftW),
                                          opt(alt(seq(new Source(), opt(tabdef)),
                                                  strucOrTab)),
                                          rparen));

    let when = seq(str("WHEN"), new Cond(), str("THEN"), new Source());

    let elsee = seq(str("ELSE"), new Source());

    let cond = ver(Version.v740sp02, seq(str("COND"),
                                         new TypeName(),
                                         tok(ParenLeftW),
                                         opt(alet),
                                         plus(when),
                                         opt(elsee),
                                         rparen));

    let reff = ver(Version.v740sp02, seq(str("REF"),
                                         new TypeName(),
                                         tok(ParenLeftW),
                                         new Source(),
                                         rparen));

    let exact = ver(Version.v740sp02, seq(str("EXACT"),
                                          new TypeName(),
                                          tok(ParenLeftW),
                                          new Source(),
                                          rparen));

    let filter = ver(Version.v740sp08,
                     seq(str("FILTER"),
                         new TypeName(),
                         tok(ParenLeftW),
                         new Source(),
                         opt(str("EXCEPT")),
                         opt(seq(str("IN"), new Source())),
                         opt(seq(str("USING KEY"), new Field())),
                         seq(str("WHERE"), new Cond()),
                         rparen));

    let ret = alt(old, corr, conv, value, cond, reff, exact, swit, filter);

    return ret;
  }
}