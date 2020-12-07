import {seq, altPrio, optPrio, Expression} from "../combi";
import {PassByValue, FormParamType, FormParamName, NamespaceSimpleName} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class FormParam extends Expression {
  public getRunnable(): IStatementRunnable {
    const stru = seq(FormParamName, "STRUCTURE", NamespaceSimpleName);
    const val = seq(PassByValue, optPrio(FormParamType));
    const field = seq(FormParamName, optPrio(FormParamType));

    const ret = altPrio(stru, val, field);

    return ret;
  }
}