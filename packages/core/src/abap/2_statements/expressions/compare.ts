import {seq, ver, tok, plus, opt, optPrio, altPrio, Expression} from "../combi";
import {FieldSub, ClassName, Constant, Source, MethodCallChain, CompareOperator, SourceFieldSymbolChain} from ".";
import {WParenLeft, ParenRightW} from "../../1_lexer/tokens";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Compare extends Expression {
  public getRunnable(): IStatementRunnable {
    const val = altPrio(FieldSub, Constant);

    const list = seq(tok(WParenLeft),
                     val,
                     plus(seq(",", val)),
                     tok(ParenRightW));

    const inn = seq(optPrio("NOT"), "IN", altPrio(Source, list));

    const sopt = seq("IS",
                     optPrio("NOT"),
                     altPrio("SUPPLIED",
                             "BOUND",
                             ver(Version.v750, seq("INSTANCE OF", ClassName), Version.OpenABAP),
                             "REQUESTED",
                             "INITIAL"));

    const between = seq(optPrio("NOT"), "BETWEEN", Source, "AND", Source);

    const predicate = ver(Version.v740sp08, MethodCallChain);

    const rett = seq(Source, altPrio(seq(CompareOperator, Source), inn, between, sopt));

    const fsassign = seq(SourceFieldSymbolChain, "IS", optPrio("NOT"), "ASSIGNED");

    const ret = seq(opt("NOT"), altPrio(rett, predicate, fsassign));

    return ret;
  }
}