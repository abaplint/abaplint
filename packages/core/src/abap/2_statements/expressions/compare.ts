import {seqs, ver, tok, plus, opts, optPrio, altPrios, str, Expression} from "../combi";
import {FieldSub, ClassName, Constant, Source, MethodCallChain, CompareOperator} from ".";
import {WParenLeft, ParenRightW} from "../../1_lexer/tokens";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Compare extends Expression {
  public getRunnable(): IStatementRunnable {
    const val = altPrios(FieldSub, Constant);

    const list = seqs(tok(WParenLeft),
                      val,
                      plus(seqs(",", val)),
                      tok(ParenRightW));

    const inn = seqs(optPrio(str("NOT")), str("IN"), altPrios(Source, list));

    const sopt = seqs(str("IS"),
                      optPrio(str("NOT")),
                      altPrios("SUPPLIED",
                               "BOUND",
                               ver(Version.v750, seqs("INSTANCE OF", ClassName)),
                               "REQUESTED",
                               "ASSIGNED",
                               "INITIAL"));

    const between = seqs(optPrio(str("NOT")), "BETWEEN", Source, "AND", Source);

    const predicate = ver(Version.v740sp08, new MethodCallChain());

    const rett = seqs(Source, altPrios(seqs(CompareOperator, Source), inn, between, sopt));

    const ret = seqs(opts("NOT"), altPrios(rett, predicate));

    return ret;
  }
}