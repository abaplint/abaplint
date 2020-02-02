import {plus, ver, seq, opt, tok, str, alt, star, altPrio, optPrio, regex, Expression, IStatementRunnable} from "../combi";
import {InstanceArrow, WParenLeftW, WParenRightW, WDashW, ParenLeftW} from "../tokens/";
import {MethodCallChain, ArithOperator, Cond, Constant, StringTemplate, Let, ComponentCond, SimpleName} from "./";
import {FieldChain, Field, TableBody, TypeNameOrInfer, ArrowOrDash, FieldSub, For, Throw} from "./";
import {Version} from "../../version";
import {ComponentChain, ComponentName} from "./";
import {InlineFieldDefinition} from "./inline_field_definition";

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

    const bool = seq(altPrio(ver(Version.v702, regex(/^BOOLC$/i)),
                             ver(Version.v740sp08, regex(/^XSDBOOL$/i))),
                     tok(ParenLeftW),
                     new Cond(),
                     str(")"));

    const prefix = altPrio(tok(WDashW), str("BIT-NOT"));

    const old = seq(altPrio(new Constant(),
                            new StringTemplate(),
                            bool,
                            method,
                            seq(optPrio(prefix), new FieldChain()),
                            paren),
                    optPrio(altPrio(ref, after, new TableBody())));

    const mapping = seq(str("MAPPING"), plus(seq(new ComponentName(), str("="), new ComponentName())));

    const baseParen = seq(str("BASE"), tok(WParenLeftW), new Source(), tok(WParenRightW));

    const discarding = ver(Version.v751, str("DISCARDING DUPLICATES"));

    const corr = ver(Version.v740sp05, seq(str("CORRESPONDING"),
                                           new TypeNameOrInfer(),
                                           tok(ParenLeftW),
                                           opt(baseParen),
                                           new Source(),
                                           opt(discarding),
                                           opt(mapping),
                                           opt(seq(str("EXCEPT"), alt(plus(new Field()), str("*")))),
                                           rparen));

    const arith = seq(new ArithOperator(), new Source());

    const conv = ver(Version.v740sp02, seq(str("CONV"),
                                           new TypeNameOrInfer(),
                                           tok(ParenLeftW),
                                           opt(new Let()),
                                           new Source(),
                                           rparen, opt(arith)));

    const or = seq(str("OR"), new Source());

    const swhen = seq(str("WHEN"), new Source(), star(or), str("THEN"), alt(new Source(), new Throw()));
    const swit = ver(Version.v740sp02, seq(str("SWITCH"),
                                           new TypeNameOrInfer(),
                                           tok(ParenLeftW),
                                           opt(new Let()),
                                           new Source(),
                                           plus(swhen),
                                           opt(seq(str("ELSE"), alt(new Source(), new Throw()))),
                                           rparen));

    const fieldList = seq(new FieldSub(), str("="), new Source());

    const base = seq(str("BASE"), new Source());

    const foo = seq(tok(WParenLeftW), optPrio(altPrio(plus(fieldList), seq(optPrio(str("LINES OF")), new Source()))), tok(WParenRightW));

    const tab = seq(optPrio(new For()),
                    star(seq(star(fieldList), foo)));

    const strucOrTab = seq(optPrio(new Let()), optPrio(base),
                           alt(plus(fieldList), tab));

    const tabdef = ver(Version.v740sp08, alt(str("OPTIONAL"), seq(str("DEFAULT"), new Source())));

    const value = ver(Version.v740sp02, seq(str("VALUE"),
                                            new TypeNameOrInfer(),
                                            tok(ParenLeftW),
                                            optPrio(alt(strucOrTab, seq(new Source(), optPrio(tabdef)))),
                                            rparen));

    const when = seq(str("WHEN"), new Cond(), str("THEN"), alt(new Source(), new Throw()));

    const elsee = seq(str("ELSE"), alt(new Source(), new Throw()));

    const cond = ver(Version.v740sp02, seq(str("COND"),
                                           new TypeNameOrInfer(),
                                           tok(ParenLeftW),
                                           opt(new Let()),
                                           plus(when),
                                           opt(elsee),
                                           rparen,
                                           opt(after)));

    const reff = ver(Version.v740sp02, seq(str("REF"),
                                           new TypeNameOrInfer(),
                                           tok(ParenLeftW),
                                           new Source(),
                                           rparen));

    const exact = ver(Version.v740sp02, seq(str("EXACT"),
                                            new TypeNameOrInfer(),
                                            tok(ParenLeftW),
                                            new Source(),
                                            rparen));

    const filter = ver(Version.v740sp08,
                       seq(str("FILTER"),
                           new TypeNameOrInfer(),
                           tok(ParenLeftW),
                           new Source(),
                           opt(str("EXCEPT")),
                           opt(seq(str("IN"), new Source())),
                           opt(seq(str("USING KEY"), new SimpleName())),
                           seq(str("WHERE"), new ComponentCond()),
                           rparen));

    const fields = seq(new Field(), str("="), new Source());

    const init = seq(str("INIT"), plus(new InlineFieldDefinition()));

    const reduce = ver(Version.v740sp08,
                       seq(str("REDUCE"),
                           new TypeNameOrInfer(),
                           tok(ParenLeftW),
                           opt(new Let()),
                           init,
                           new For(),
                           str("NEXT"),
                           plus(fields),
                           rparen,
                           opt(after)));

    const ret = altPrio(corr, conv, value, cond, reff, exact, swit, filter, reduce, old);

    return ret;
  }
}