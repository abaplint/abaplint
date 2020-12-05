import {seqs, altPrio, optPrio, Expression} from "../combi";
import {PassByValue, FormParamType, FormParamName, NamespaceSimpleName} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class FormParam extends Expression {
  public getRunnable(): IStatementRunnable {
    const stru = seqs(FormParamName, "STRUCTURE", NamespaceSimpleName);
    const val = seqs(PassByValue, optPrio(new FormParamType()));
    const field = seqs(FormParamName, optPrio(new FormParamType()));

    const ret = altPrio(stru, val, field);

    return ret;
  }
}