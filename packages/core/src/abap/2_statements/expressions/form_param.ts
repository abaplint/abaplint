import {seq, altPrio, optPrio, Expression, str} from "../combi";
import {PassByValue, FormParamType, FormParamName, NamespaceSimpleName} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class FormParam extends Expression {
  public getRunnable(): IStatementRunnable {
    const stru = seq(new FormParamName(), str("STRUCTURE"), new NamespaceSimpleName());
    const val = seq(new PassByValue(), optPrio(new FormParamType()));
    const field = seq(new FormParamName(), optPrio(new FormParamType()));

    const ret = altPrio(stru, val, field);

    return ret;
  }
}