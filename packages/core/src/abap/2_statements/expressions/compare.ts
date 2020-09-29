import {seq, opt, ver, tok, plus, alt, optPrio, altPrio, str, Expression} from "../combi";
import {FieldSub, ClassName, Constant, Source, MethodCallChain, CompareOperator} from ".";
import {WParenLeft, ParenRightW} from "../../1_lexer/tokens";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Compare extends Expression {
  public getRunnable(): IStatementRunnable {
    const val = altPrio(new FieldSub(), new Constant());

    const list = seq(tok(WParenLeft),
                     val,
                     plus(seq(str(","), val)),
                     tok(ParenRightW));

    const inn = seq(opt(str("NOT")), str("IN"), altPrio(new Source(), list));

    const sopt = seq(str("IS"),
                     optPrio(str("NOT")),
                     altPrio(str("SUPPLIED"),
                             str("BOUND"),
                             ver(Version.v750, seq(str("INSTANCE OF"), new ClassName())),
                             str("REQUESTED"),
                             str("ASSIGNED"),
                             str("INITIAL")));

    const between = seq(opt(str("NOT")), str("BETWEEN"), new Source(), str("AND"), new Source());

    const predicate = ver(Version.v740sp08, new MethodCallChain());

    const rett = seq(new Source(),
                     alt(seq(new CompareOperator(), new Source()),
                         inn,
                         between,
                         sopt));

    const ret = seq(opt(str("NOT")), alt(predicate, rett));

    return ret;
  }
}