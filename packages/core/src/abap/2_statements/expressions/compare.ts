import {seqs, ver, tok, plus, opt, optPrio, altPrio, str, Expression} from "../combi";
import {FieldSub, ClassName, Constant, Source, MethodCallChain, CompareOperator} from ".";
import {WParenLeft, ParenRightW} from "../../1_lexer/tokens";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Compare extends Expression {
  public getRunnable(): IStatementRunnable {
    const val = altPrio(new FieldSub(), new Constant());

    const list = seqs(tok(WParenLeft),
                      val,
                      plus(seqs(",", val)),
                      tok(ParenRightW));

    const inn = seqs(optPrio(str("NOT")), str("IN"), altPrio(new Source(), list));

    const sopt = seqs(str("IS"),
                      optPrio(str("NOT")),
                      altPrio(str("SUPPLIED"),
                              str("BOUND"),
                              ver(Version.v750, seqs("INSTANCE OF", ClassName)),
                              str("REQUESTED"),
                              str("ASSIGNED"),
                              str("INITIAL")));

    const between = seqs(optPrio(str("NOT")), "BETWEEN", Source, "AND", Source);

    const predicate = ver(Version.v740sp08, new MethodCallChain());

    const rett = seqs(Source,
                      altPrio(seqs(CompareOperator, Source),
                              inn,
                              between,
                              sopt));

    const ret = seqs(opt(str("NOT")), altPrio(rett, predicate));

    return ret;
  }
}