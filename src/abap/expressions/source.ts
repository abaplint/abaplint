import {plus, ver, seq, opt, tok, str, alt, star, optPrio, regex, Expression, IStatementRunnable} from "../combi";
import {InstanceArrow, WParenLeftW, WParenRightW, WDashW, ParenLeftW} from "../tokens/";
import {MethodCallChain, ArithOperator, Cond, Constant, StringTemplate, Let, ComponentCond, SimpleName} from "./";
import {FieldChain, Field, TableBody, TypeName, ArrowOrDash, FieldSub, For, Throw} from "./";
import {Version} from "../../version";
import {ComponentChain, ComponentName} from "./";

// todo, COND and SWITCH are quite similar?

export class Source extends Expression {
  public getRunnable(): IStatementRunnable {
    const ref = seq(tok(InstanceArrow), str("*"));

    const method = seq(new MethodCallChain(), optPrio(seq(new ArrowOrDash(), new ComponentChain())));

    const rparen = tok(WParenRightW);

// paren used for eg. "( 2 + 1 ) * 4"
    const paren = seq(tok(WParenLeftW),
                      new Source(),
                      rparen);

    const after = seq(alt(str("&"), str("&&"), new ArithOperator()), new Source());

    const bool = seq(alt(ver(Version.v702, regex(/^BOOLC$/i)),
                         ver(Version.v740sp08, regex(/^XSDBOOL$/i))),
                     tok(ParenLeftW),
                     new Cond(),
                     str(")"));

    const prefix = alt(tok(WDashW), str("BIT-NOT"));

    const old = seq(alt(new Constant(),
                        new StringTemplate(),
                        bool,
                        method,
                        seq(opt(prefix), new FieldChain()),
                        paren),
                    optPrio(alt(ref, after, new TableBody())));

    const mapping = seq(str("MAPPING"), plus(seq(new ComponentName(), str("="), new ComponentName())));

    const baseParen = seq(str("BASE"), tok(WParenLeftW), new Source(), tok(WParenRightW));

    const discarding = ver(Version.v751, str("DISCARDING DUPLICATES"));

    const corr = ver(Version.v740sp05, seq(str("CORRESPONDING"),
                                           new TypeName(),
                                           tok(ParenLeftW),
                                           opt(baseParen),
                                           new Source(),
                                           opt(discarding),
                                           opt(mapping),
                                           opt(seq(str("EXCEPT"), alt(plus(new Field()), str("*")))),
                                           rparen));

    const arith = seq(new ArithOperator(), new Source());

    const conv = ver(Version.v740sp02, seq(str("CONV"),
                                           new TypeName(),
                                           tok(ParenLeftW),
                                           opt(new Let()),
                                           new Source(),
                                           rparen, opt(arith)));

    const or = seq(str("OR"), new Source());

    const swhen = seq(str("WHEN"), new Source(), star(or), str("THEN"), alt(new Source(), new Throw()));
    const swit = ver(Version.v740sp02, seq(str("SWITCH"),
                                           new TypeName(),
                                           tok(ParenLeftW),
                                           opt(new Let()),
                                           new Source(),
                                           plus(swhen),
                                           opt(seq(str("ELSE"), alt(new Source(), new Throw()))),
                                           rparen));

    const fieldList = seq(new FieldSub(), str("="), new Source());

    const base = seq(str("BASE"), new Source());

    const tab = seq(opt(new For()),
                    alt(plus(seq(tok(WParenLeftW), opt(seq(opt(str("LINES OF")), new Source())), tok(WParenRightW))),
                        plus(seq(star(fieldList), seq(tok(WParenLeftW), plus(fieldList), tok(WParenRightW))))));

    const strucOrTab = seq(opt(new Let()), opt(base),
                           alt(plus(fieldList),
                               tab));

    const tabdef = ver(Version.v740sp08, alt(str("OPTIONAL"), seq(str("DEFAULT"), new Source())));

    const value = ver(Version.v740sp02, seq(str("VALUE"),
                                            new TypeName(),
                                            tok(ParenLeftW),
                                            opt(alt(seq(new Source(), opt(tabdef)),
                                                    strucOrTab)),
                                            rparen));

    const when = seq(str("WHEN"), new Cond(), str("THEN"), alt(new Source(), new Throw()));

    const elsee = seq(str("ELSE"), alt(new Source(), new Throw()));

    const cond = ver(Version.v740sp02, seq(str("COND"),
                                           new TypeName(),
                                           tok(ParenLeftW),
                                           opt(new Let()),
                                           plus(when),
                                           opt(elsee),
                                           rparen,
                                           opt(after)));

    const reff = ver(Version.v740sp02, seq(str("REF"),
                                           new TypeName(),
                                           tok(ParenLeftW),
                                           new Source(),
                                           rparen));

    const exact = ver(Version.v740sp02, seq(str("EXACT"),
                                            new TypeName(),
                                            tok(ParenLeftW),
                                            new Source(),
                                            rparen));

    const filter = ver(Version.v740sp08,
                       seq(str("FILTER"),
                           new TypeName(),
                           tok(ParenLeftW),
                           new Source(),
                           opt(str("EXCEPT")),
                           opt(seq(str("IN"), new Source())),
                           opt(seq(str("USING KEY"), new SimpleName())),
                           seq(str("WHERE"), new ComponentCond()),
                           rparen));

    const fields = seq(new Field(), str("="), new Source());

    const reduce = ver(Version.v740sp08,
                       seq(str("REDUCE"),
                           new TypeName(),
                           tok(ParenLeftW),
                           opt(new Let()),
                           str("INIT"),
                           plus(fields),
                           new For(),
                           str("NEXT"),
                           plus(fields),
                           rparen,
                           opt(after)));

    const ret = alt(old, corr, conv, value, cond, reff, exact, swit, filter, reduce);

    return ret;
  }
}