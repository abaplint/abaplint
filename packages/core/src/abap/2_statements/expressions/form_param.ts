import {seq, altPrios, optPrios, Expression} from "../combi";
import {PassByValue, FormParamType, FormParamName, NamespaceSimpleName} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class FormParam extends Expression {
  public getRunnable(): IStatementRunnable {
    const stru = seq(FormParamName, "STRUCTURE", NamespaceSimpleName);
    const val = seq(PassByValue, optPrios(FormParamType));
    const field = seq(FormParamName, optPrios(FormParamType));

    const ret = altPrios(stru, val, field);

    return ret;
  }
}