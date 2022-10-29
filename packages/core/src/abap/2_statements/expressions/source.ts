import {ver, seq, tok, altPrio, optPrio, regex, Expression, starPrio} from "../combi";
import {WParenLeftW, WParenRightW, WDashW, ParenLeftW, WPlus, WPlusW, Dash, ParenRightW} from "../../1_lexer/tokens";
import {CondBody, SwitchBody, ComponentChain, FieldChain, ReduceBody, TypeNameOrInfer,
  MethodCallChain, ArithOperator, Cond, Constant, StringTemplate, ConvBody, CorrespondingBody, ValueBody, FilterBody, Arrow} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {TextElement} from "./text_element";
import {AttributeChain} from "./attribute_chain";
import {Dereference} from "./dereference";

// todo, COND and SWITCH are quite similar?

// this class is used quite often, so its nice to have the differentiating tokens part of it

export class Source extends Expression {
  public getRunnable(): IStatementRunnable {
    const comp = seq(tok(Dash), ComponentChain);
    const attr = seq(Arrow, AttributeChain);
    const method = seq(MethodCallChain, optPrio(altPrio(attr, comp)), optPrio(Dereference));

    const rparen = tok(WParenRightW);
    const rparenNoSpace = altPrio(tok(ParenRightW), tok(WParenRightW));

// paren used for eg. "( 2 + 1 ) * 4"
    const paren = seq(tok(WParenLeftW),
                      Source,
                      rparen);

    const after = seq(altPrio("&", "&&", ArithOperator), Source);

    const bool = seq(altPrio(ver(Version.v702, regex(/^BOOLC$/i)),
                             ver(Version.v740sp08, regex(/^XSDBOOL$/i))),
                     tok(ParenLeftW),
                     Cond,
                     ")");

    const prefix = altPrio(tok(WPlus), "BIT-NOT");

    const old = seq(optPrio(prefix), altPrio(Constant,
                                             StringTemplate,
                                             TextElement,
                                             bool,
                                             method,
                                             seq(FieldChain, optPrio(Dereference)),
                                             paren),
                    optPrio(after));

    const corr = ver(Version.v740sp05, seq("CORRESPONDING",
                                           TypeNameOrInfer,
                                           tok(ParenLeftW),
                                           CorrespondingBody,
                                           rparen,
                                           optPrio(after)));

    const conv = ver(Version.v740sp02, seq("CONV",
                                           TypeNameOrInfer,
                                           tok(ParenLeftW),
                                           ConvBody,
                                           rparenNoSpace,
                                           optPrio(after)));

    const swit = ver(Version.v740sp02, seq("SWITCH",
                                           TypeNameOrInfer,
                                           tok(ParenLeftW),
                                           SwitchBody,
                                           rparenNoSpace,
                                           optPrio(after)));

    const value = ver(Version.v740sp02, seq("VALUE",
                                            TypeNameOrInfer,
                                            tok(ParenLeftW),
                                            ValueBody,
                                            rparenNoSpace,
                                            optPrio(after)));

    const cond = ver(Version.v740sp02, seq("COND",
                                           TypeNameOrInfer,
                                           tok(ParenLeftW),
                                           CondBody,
                                           rparenNoSpace,
                                           optPrio(after)));

    const reff = ver(Version.v740sp02, seq("REF",
                                           TypeNameOrInfer,
                                           tok(ParenLeftW),
                                           Source,
                                           optPrio("OPTIONAL"),
                                           rparen));

    const exact = ver(Version.v740sp02, seq("EXACT",
                                            TypeNameOrInfer,
                                            tok(ParenLeftW),
                                            Source,
                                            rparen,
                                            optPrio(after)));

    const filter = ver(Version.v740sp08,
                       seq("FILTER",
                           TypeNameOrInfer,
                           tok(ParenLeftW),
                           FilterBody,
                           rparen));

    const reduce = ver(Version.v740sp08,
                       seq("REDUCE",
                           TypeNameOrInfer,
                           tok(ParenLeftW),
                           ReduceBody,
                           rparen,
                           optPrio(after)));

    const prefix1 = altPrio(tok(WDashW), tok(WPlusW));

    const ret = seq(starPrio(prefix1),
                    altPrio(filter, reff, corr, conv, value, cond, exact, swit, reduce, old));

    return ret;
  }
}