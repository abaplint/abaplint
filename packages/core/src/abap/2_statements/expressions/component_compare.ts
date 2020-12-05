import {seqs, opt, ver, tok, plus, alt, str, Expression} from "../combi";
import {ComponentChainSimple, FieldSub, Constant, Source, CompareOperator} from ".";
import {WParenLeft, ParenRightW} from "../../1_lexer/tokens";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class ComponentCompare extends Expression {
  public getRunnable(): IStatementRunnable {
    const val = alt(new FieldSub(), new Constant());

    const list = seqs(tok(WParenLeft),
                      val,
                      plus(seqs(",", val)),
                      tok(ParenRightW));

    const inn = seqs(opt(str("NOT")), str("IN"), alt(new Source(), list));

    const sopt = seqs("IS",
                      opt(str("NOT")),
                      alt(str("SUPPLIED"),
                          str("BOUND"),
                          ver(Version.v750, seqs("INSTANCE OF", Source)),
                          str("REQUESTED"),
                          str("ASSIGNED"),
                          str("INITIAL")));

    const between = seqs(opt(str("NOT")), "BETWEEN", Source, "AND", Source);

    const rett = seqs(ComponentChainSimple,
                      alt(seqs(CompareOperator, Source),
                          inn,
                          between,
                          sopt));

    const ret = seqs(opt(str("NOT")), rett);

    return ret;
  }
}