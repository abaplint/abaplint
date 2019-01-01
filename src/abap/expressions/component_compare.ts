import {seq, opt, ver, tok, plus, alt, str, Expression, IStatementRunnable} from "../combi";
import {FieldSub, Constant, Source, CompareOperator} from "./";
import {WParenLeft, ParenRightW} from "../tokens/";
import {Version} from "../../version";
import {FieldChain} from "./field_chain";

export class ComponentCompare extends Expression {
  public getRunnable(): IStatementRunnable {
    const val = alt(new FieldSub(), new Constant());

    const list = seq(tok(WParenLeft),
                     val,
                     plus(seq(str(","), val)),
                     tok(ParenRightW));

    const inn = seq(opt(str("NOT")), str("IN"), alt(new Source(), list));

    const sopt = seq(str("IS"),
                     opt(str("NOT")),
                     alt(str("SUPPLIED"),
                         str("BOUND"),
                         ver(Version.v750, seq(str("INSTANCE OF"), new Source())),
                         str("REQUESTED"),
                         str("ASSIGNED"),
                         str("INITIAL")));

    const between = seq(opt(str("NOT")), str("BETWEEN"), new Source(), str("AND"), new Source());

    const rett = seq(new FieldChain(),
                     alt(seq(new CompareOperator(), new Source()),
                         inn,
                         between,
                         sopt));

    const ret = seq(opt(str("NOT")), rett);

    return ret;
  }
}