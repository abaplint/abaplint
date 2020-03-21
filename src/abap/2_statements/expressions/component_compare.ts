import {seq, opt, ver, tok, plus, alt, str, Expression} from "../combi";
import {ComponentChainSimple, FieldSub, Constant, Source, CompareOperator} from ".";
import {WParenLeft, ParenRightW} from "../../1_lexer/tokens";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

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

    const rett = seq(new ComponentChainSimple(),
                     alt(seq(new CompareOperator(), new Source()),
                         inn,
                         between,
                         sopt));

    const ret = seq(opt(str("NOT")), rett);

    return ret;
  }
}