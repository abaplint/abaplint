import {seq, alt, Expression, optPrio} from "../combi";
import {Source, MethodParameters} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {MethodCallParam} from "./method_call_param";

export class MethodCallBody extends Expression {
  public getRunnable(): IStatementRunnable {
    const dynamicPar = seq("PARAMETER-TABLE", Source);
    const dynamicExc = seq("EXCEPTION-TABLE", Source);
    const dynamic = seq(dynamicPar, optPrio(dynamicExc));

    return alt(MethodCallParam, MethodParameters, dynamic);
  }
}