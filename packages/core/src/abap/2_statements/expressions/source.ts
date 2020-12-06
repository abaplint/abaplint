import {vers, seq, tok, altPrio, optPrios, regex, Expression} from "../combi";
import {WParenLeftW, WParenRightW, WDashW, ParenLeftW, WPlus, WPlusW, Dash, InstanceArrow} from "../../1_lexer/tokens";
import {CondBody, SwitchBody, ComponentChain, FieldChain, ReduceBody, TypeNameOrInfer,
  MethodCallChain, ArithOperator, Cond, Constant, StringTemplate, ConvBody, CorrespondingBody, ValueBody, FilterBody, Arrow} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {TextElement} from "./text_element";
import {AttributeChain} from "./attribute_chain";

// todo, COND and SWITCH are quite similar?

// this class is used quite often, so its nice to have the differentiating tokens part of it

export class Source extends Expression {
  public getRunnable(): IStatementRunnable {
    const ref = seq(tok(InstanceArrow), "*");

    const comp = seq(tok(Dash), ComponentChain);
    const attr = seq(Arrow, AttributeChain);
    const method = seq(MethodCallChain, optPrios(altPrio(attr, comp)), optPrios(ref));

    const rparen = tok(WParenRightW);

// paren used for eg. "( 2 + 1 ) * 4"
    const paren = seq(tok(WParenLeftW),
                      Source,
                      rparen);

    const after = seq(altPrio("&", "&&", ArithOperator), Source);

    const bool = seq(altPrio(vers(Version.v702, regex(/^BOOLC$/i)),
                             vers(Version.v740sp08, regex(/^XSDBOOL$/i))),
                     tok(ParenLeftW),
                     Cond,
                     ")");

    const prefix = altPrio(tok(WDashW), tok(WPlus), tok(WPlusW), "BIT-NOT");

    const old = seq(optPrios(prefix), altPrio(Constant,
                                              StringTemplate,
                                              TextElement,
                                              bool,
                                              method,
                                              seq(FieldChain, optPrios(ref)),
                                              paren),
                    optPrios(after));

    const corr = vers(Version.v740sp05, seq("CORRESPONDING",
                                            TypeNameOrInfer,
                                            tok(ParenLeftW),
                                            CorrespondingBody,
                                            rparen));

    const conv = vers(Version.v740sp02, seq("CONV",
                                            TypeNameOrInfer,
                                            tok(ParenLeftW),
                                            ConvBody,
                                            rparen, optPrios(after)));

    const swit = vers(Version.v740sp02, seq("SWITCH",
                                            TypeNameOrInfer,
                                            tok(ParenLeftW),
                                            SwitchBody,
                                            rparen));

    const value = vers(Version.v740sp02, seq("VALUE",
                                             TypeNameOrInfer,
                                             tok(ParenLeftW),
                                             ValueBody,
                                             rparen));

    const cond = vers(Version.v740sp02, seq("COND",
                                            TypeNameOrInfer,
                                            tok(ParenLeftW),
                                            CondBody,
                                            rparen,
                                            optPrios(after)));

    const reff = vers(Version.v740sp02, seq("REF",
                                            TypeNameOrInfer,
                                            tok(ParenLeftW),
                                            Source,
                                            optPrios("OPTIONAL"),
                                            rparen));

    const exact = vers(Version.v740sp02, seq("EXACT",
                                             TypeNameOrInfer,
                                             tok(ParenLeftW),
                                             Source,
                                             rparen));

    const filter = vers(Version.v740sp08,
                        seq("FILTER",
                            TypeNameOrInfer,
                            tok(ParenLeftW),
                            FilterBody,
                            rparen));

    const reduce = vers(Version.v740sp08,
                        seq("REDUCE",
                            TypeNameOrInfer,
                            tok(ParenLeftW),
                            ReduceBody,
                            rparen,
                            optPrios(after)));

    const ret = altPrio(corr, conv, value, cond, reff, exact, swit, filter, reduce, old);

    return ret;
  }
}