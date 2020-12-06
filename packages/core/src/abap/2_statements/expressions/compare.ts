import {seq, vers, tok, pluss, opt, optPrio, altPrio, Expression} from "../combi";
import {FieldSub, ClassName, Constant, Source, MethodCallChain, CompareOperator} from ".";
import {WParenLeft, ParenRightW} from "../../1_lexer/tokens";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Compare extends Expression {
  public getRunnable(): IStatementRunnable {
    const val = altPrio(FieldSub, Constant);

    const list = seq(tok(WParenLeft),
                     val,
                     pluss(seq(",", val)),
                     tok(ParenRightW));

    const inn = seq(optPrio("NOT"), "IN", altPrio(Source, list));

    const sopt = seq("IS",
                     optPrio("NOT"),
                     altPrio("SUPPLIED",
                             "BOUND",
                             vers(Version.v750, seq("INSTANCE OF", ClassName)),
                             "REQUESTED",
                             "ASSIGNED",
                             "INITIAL"));

    const between = seq(optPrio("NOT"), "BETWEEN", Source, "AND", Source);

    const predicate = vers(Version.v740sp08, MethodCallChain);

    const rett = seq(Source, altPrio(seq(CompareOperator, Source), inn, between, sopt));

    const ret = seq(opt("NOT"), altPrio(rett, predicate));

    return ret;
  }
}