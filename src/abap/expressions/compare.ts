import {seq, opt, ver, tok, plus, alt, str, Expression, IStatementRunnable} from "../combi";
import {FieldSub, Constant, Source, MethodCallChain} from "./";
import {WParenLeft, ParenRightW} from "../tokens/";
import {Version} from "../../version";

export class Compare extends Expression {
  public getRunnable(): IStatementRunnable {
    const val = alt(new FieldSub(), new Constant());

    const list = seq(tok(WParenLeft),
                     val,
                     plus(seq(str(","), val)),
                     tok(ParenRightW));

    const inn = seq(opt(str("NOT")), str("IN"), alt(new Source(), list));

    const operator = seq(opt(str("NOT")),
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

    const sopt = seq(str("IS"),
                     opt(str("NOT")),
                     alt(str("SUPPLIED"),
                         str("BOUND"),
                         ver(Version.v750, seq(str("INSTANCE OF"), new Source())),
                         str("REQUESTED"),
                         str("ASSIGNED"),
                         str("INITIAL")));

    const between = seq(opt(str("NOT")), str("BETWEEN"), new Source(), str("AND"), new Source());

    const predicate = ver(Version.v740sp08, new MethodCallChain());

    const rett = seq(new Source(),
                     alt(seq(operator, new Source()),
                         inn,
                         between,
                         sopt));

    const ret = seq(opt(str("NOT")), alt(predicate, rett));

    return ret;
  }
}