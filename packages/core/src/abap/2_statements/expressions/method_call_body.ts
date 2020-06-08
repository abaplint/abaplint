import {seq, alt, opt, str, Expression} from "../combi";
import {Source, MethodParameters} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {MethodCallParam} from "./method_call_param";

export class MethodCallBody extends Expression {
  public getRunnable(): IStatementRunnable {
    const dynamicPar = seq(str("PARAMETER-TABLE"), new Source());
    const dynamicExc = seq(str("EXCEPTION-TABLE"), new Source());
    const dynamic = seq(dynamicPar, opt(dynamicExc));

    return alt(new MethodCallParam(), new MethodParameters(), dynamic);
  }
}