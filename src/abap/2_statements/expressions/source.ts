import {ver, seq, opt, tok, str, altPrio, optPrio, regex, Expression} from "../combi";
import {InstanceArrow, WParenLeftW, WParenRightW, WDashW, ParenLeftW} from "../../1_lexer/tokens";
import {CondBody, SwitchBody, ComponentChain, FieldChain, ReduceBody, TableBody, TypeNameOrInfer, ArrowOrDash,
  MethodCallChain, ArithOperator, Cond, Constant, StringTemplate, Let, CorrespondingBody, ValueBody, FilterBody} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

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

    const after = seq(altPrio(str("&"), str("&&"), new ArithOperator()), new Source());

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

    const corr = ver(Version.v740sp05, seq(str("CORRESPONDING"),
                                           new TypeNameOrInfer(),
                                           tok(ParenLeftW),
                                           new CorrespondingBody(),
                                           rparen));

    const conv = ver(Version.v740sp02, seq(str("CONV"),
                                           new TypeNameOrInfer(),
                                           tok(ParenLeftW),
                                           opt(new Let()),
                                           new Source(),
                                           rparen, opt(after)));

    const swit = ver(Version.v740sp02, seq(str("SWITCH"),
                                           new TypeNameOrInfer(),
                                           tok(ParenLeftW),
                                           new SwitchBody(),
                                           rparen));

    const value = ver(Version.v740sp02, seq(str("VALUE"),
                                            new TypeNameOrInfer(),
                                            tok(ParenLeftW),
                                            new ValueBody(),
                                            rparen));

    const cond = ver(Version.v740sp02, seq(str("COND"),
                                           new TypeNameOrInfer(),
                                           tok(ParenLeftW),
                                           new CondBody(),
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
                           new FilterBody(),
                           rparen));

    const reduce = ver(Version.v740sp08,
                       seq(str("REDUCE"),
                           new TypeNameOrInfer(),
                           tok(ParenLeftW),
                           new ReduceBody(),
                           rparen,
                           opt(after)));

    const ret = altPrio(corr, conv, value, cond, reff, exact, swit, filter, reduce, old);

    return ret;
  }
}