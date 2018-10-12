import {seq, opt, ver, tok, star, alt, optPrio, str, Expression, IRunnable} from "../combi";
import {FieldSub, Constant, Source, SQLFieldName, Dynamic, Select} from "./";
import {WParenLeft, ParenRightW, ParenRight, WAt, WParenLeftW, WParenRight} from "../tokens/";
import {Version} from "../../version";

export class SQLCompare extends Expression {
  public get_runnable(): IRunnable {
    let val = alt(seq(opt(ver(Version.v740sp05, tok(WAt))), new FieldSub()), new Constant());

    let list = seq(alt(tok(WParenLeft), tok(WParenLeftW)),
                   val,
                   star(seq(str(","), val)),
                   alt(tok(WParenRight), tok(ParenRightW), tok(ParenRight)));

    let subSelect = seq(str("("), new Select(), str(")"));

    let inn = seq(opt(str("NOT")),
                  str("IN"),
                  alt(seq(opt(ver(Version.v740sp05, tok(WAt))), new Source()), list, subSelect));

    let operator = alt(str("="),
                       str("<>"),
                       str("><"),
                       str("<"),
                       str(">"),
                       str("<="),
                       str("=>"),
                       str(">="),
                       str("EQ"),
                       str("NE"),
                       str("GE"),
                       str("GT"),
                       str("LT"),
                       str("LE"));

    let between = seq(str("BETWEEN"), new Source(), str("AND"), new Source());

    let like = seq(opt(str("NOT")), str("LIKE"), new Source(), optPrio(seq(str("ESCAPE"), new Source())));

    let nul = seq(str("IS"), opt(str("NOT")), str("NULL"));

    let rett = seq(new SQLFieldName(),
                   alt(seq(operator, opt(ver(Version.v740sp05, tok(WAt))), new Source()),
                       inn,
                       like,
                       between,
                       nul));

    let ret = rett;

    let exists = seq(str("EXISTS"), subSelect);

    return alt(ret, new Dynamic(), exists);
  }
}