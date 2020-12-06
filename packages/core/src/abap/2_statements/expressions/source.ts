import {ver, seqs, tok, str, altPrios, optPrio, regex, Expression} from "../combi";
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
    const ref = seqs(tok(InstanceArrow), "*");

    const comp = seqs(tok(Dash), ComponentChain);
    const attr = seqs(Arrow, AttributeChain);
    const method = seqs(MethodCallChain, optPrio(altPrios(attr, comp)), optPrio(ref));

    const rparen = tok(WParenRightW);

// paren used for eg. "( 2 + 1 ) * 4"
    const paren = seqs(tok(WParenLeftW),
                       Source,
                       rparen);

    const after = seqs(altPrios("&", "&&", ArithOperator), Source);

    const bool = seqs(altPrios(ver(Version.v702, regex(/^BOOLC$/i)),
                               ver(Version.v740sp08, regex(/^XSDBOOL$/i))),
                      tok(ParenLeftW),
                      Cond,
                      ")");

    const prefix = altPrios(tok(WDashW), tok(WPlus), tok(WPlusW), "BIT-NOT");

    const old = seqs(optPrio(prefix), altPrios(Constant,
                                               StringTemplate,
                                               TextElement,
                                               bool,
                                               method,
                                               seqs(FieldChain, optPrio(ref)),
                                               paren),
                     optPrio(after));

    const corr = ver(Version.v740sp05, seqs("CORRESPONDING",
                                            TypeNameOrInfer,
                                            tok(ParenLeftW),
                                            CorrespondingBody,
                                            rparen));

    const conv = ver(Version.v740sp02, seqs("CONV",
                                            TypeNameOrInfer,
                                            tok(ParenLeftW),
                                            ConvBody,
                                            rparen, optPrio(after)));

    const swit = ver(Version.v740sp02, seqs("SWITCH",
                                            TypeNameOrInfer,
                                            tok(ParenLeftW),
                                            SwitchBody,
                                            rparen));

    const value = ver(Version.v740sp02, seqs("VALUE",
                                             TypeNameOrInfer,
                                             tok(ParenLeftW),
                                             ValueBody,
                                             rparen));

    const cond = ver(Version.v740sp02, seqs("COND",
                                            TypeNameOrInfer,
                                            tok(ParenLeftW),
                                            CondBody,
                                            rparen,
                                            optPrio(after)));

    const reff = ver(Version.v740sp02, seqs("REF",
                                            TypeNameOrInfer,
                                            tok(ParenLeftW),
                                            Source,
                                            optPrio(str("OPTIONAL")),
                                            rparen));

    const exact = ver(Version.v740sp02, seqs("EXACT",
                                             TypeNameOrInfer,
                                             tok(ParenLeftW),
                                             Source,
                                             rparen));

    const filter = ver(Version.v740sp08,
                       seqs("FILTER",
                            TypeNameOrInfer,
                            tok(ParenLeftW),
                            FilterBody,
                            rparen));

    const reduce = ver(Version.v740sp08,
                       seqs("REDUCE",
                            TypeNameOrInfer,
                            tok(ParenLeftW),
                            ReduceBody,
                            rparen,
                            optPrio(after)));

    const ret = altPrios(corr, conv, value, cond, reff, exact, swit, filter, reduce, old);

    return ret;
  }
}