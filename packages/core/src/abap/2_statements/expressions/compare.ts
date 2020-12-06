import {seq, vers, tok, pluss, opts, optPrios, altPrios, Expression} from "../combi";
import {FieldSub, ClassName, Constant, Source, MethodCallChain, CompareOperator} from ".";
import {WParenLeft, ParenRightW} from "../../1_lexer/tokens";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Compare extends Expression {
  public getRunnable(): IStatementRunnable {
    const val = altPrios(FieldSub, Constant);

    const list = seq(tok(WParenLeft),
                     val,
                     pluss(seq(",", val)),
                     tok(ParenRightW));

    const inn = seq(optPrios("NOT"), "IN", altPrios(Source, list));

    const sopt = seq("IS",
                     optPrios("NOT"),
                     altPrios("SUPPLIED",
                              "BOUND",
                              vers(Version.v750, seq("INSTANCE OF", ClassName)),
                              "REQUESTED",
                              "ASSIGNED",
                              "INITIAL"));

    const between = seq(optPrios("NOT"), "BETWEEN", Source, "AND", Source);

    const predicate = vers(Version.v740sp08, MethodCallChain);

    const rett = seq(Source, altPrios(seq(CompareOperator, Source), inn, between, sopt));

    const ret = seq(opts("NOT"), altPrios(rett, predicate));

    return ret;
  }
}