import {seq, opt, ver, tok, plus, alt, str, Reuse, IRunnable} from "../combi";
import {FieldSub, Constant, Source, MethodCallChain} from "./";
import {WParenLeft, ParenRightW, ParenRight} from "../tokens/";
import {Version} from "../version";

export class Compare extends Reuse {
  public get_runnable(): IRunnable {
    let val = alt(new FieldSub(), new Constant());

    let list = seq(tok(WParenLeft),
                   val,
                   plus(seq(str(","), val)),
                   alt(tok(ParenRightW), tok(ParenRight)));

    let inn = seq(opt(str("NOT")), str("IN"), alt(new Source(), list));

    let operator = seq(opt(str("NOT")),
                       alt(str("="),
                           str("<>"),
                           str("><"),
                           str("<"),
                           str(">"),
                           str("<="),
                           str(">="),
                           str("=>"),
                           str("=<"),
                           str("CA"),
                           str("CO"),
                           str("CP"),
                           str("EQ"),
                           str("NE"),
                           str("CN"),
                           str("GE"),
                           str("GT"),
                           str("LT"),
                           str("LE"),
                           str("CS"),
                           str("NS"),
                           str("NA"),
                           str("NP"),
                           str("BYTE-CO"),
                           str("BYTE-CA"),
                           str("BYTE-CS"),
                           str("BYTE-CN"),
                           str("BYTE-NA"),
                           str("BYTE-NS"),
                           str("O"), // hex comparison operator
                           str("Z"), // hex comparison operator
                           str("M")));

    let sopt = seq(str("IS"),
                   opt(str("NOT")),
                   alt(str("SUPPLIED"),
                       str("BOUND"),
                       ver(Version.v750, seq(str("INSTANCE OF"), new Source())),
                       str("REQUESTED"),
                       str("ASSIGNED"),
                       str("INITIAL")));

    let between = seq(opt(str("NOT")), str("BETWEEN"), new Source(), str("AND"), new Source());

    let predicate = ver(Version.v740sp08, new MethodCallChain());

    let rett = seq(new Source(),
                   alt(seq(operator, new Source()),
                       inn,
                       between,
                       sopt));

    let ret = seq(opt(str("NOT")), alt(predicate, rett));

    return ret;
  }
}