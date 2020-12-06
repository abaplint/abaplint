import {seqs, alts, opts, Expression} from "../combi";
import {Source, MethodParameters} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {MethodCallParam} from "./method_call_param";

export class MethodCallBody extends Expression {
  public getRunnable(): IStatementRunnable {
    const dynamicPar = seqs("PARAMETER-TABLE", Source);
    const dynamicExc = seqs("EXCEPTION-TABLE", Source);
    const dynamic = seqs(dynamicPar, opts(dynamicExc));

    return alts(MethodCallParam, MethodParameters, dynamic);
  }
}