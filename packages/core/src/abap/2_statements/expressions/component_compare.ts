import {seqs, opt, ver, tok, plus, alts, str, Expression} from "../combi";
import {ComponentChainSimple, FieldSub, Constant, Source, CompareOperator} from ".";
import {WParenLeft, ParenRightW} from "../../1_lexer/tokens";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class ComponentCompare extends Expression {
  public getRunnable(): IStatementRunnable {
    const val = alts(FieldSub, Constant);

    const list = seqs(tok(WParenLeft),
                      val,
                      plus(seqs(",", val)),
                      tok(ParenRightW));

    const inn = seqs(opt(str("NOT")), str("IN"), alts(Source, list));

    const sopt = seqs("IS",
                      opt(str("NOT")),
                      alts("SUPPLIED",
                           "BOUND",
                           ver(Version.v750, seqs("INSTANCE OF", Source)),
                           "REQUESTED",
                           "ASSIGNED",
                           "INITIAL"));

    const between = seqs(opt(str("NOT")), "BETWEEN", Source, "AND", Source);

    const rett = seqs(ComponentChainSimple, alts(seqs(CompareOperator, Source), inn, between, sopt));

    const ret = seqs(opt(str("NOT")), rett);

    return ret;
  }
}