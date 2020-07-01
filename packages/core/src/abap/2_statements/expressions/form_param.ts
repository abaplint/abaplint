import {seq, altPrio, optPrio, Expression, str} from "../combi";
import {PassByValue, FormParamType, Field, SimpleName, NamespaceSimpleName} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class FormParam extends Expression {
  public getRunnable(): IStatementRunnable {
    const stru = seq(new SimpleName(), str("STRUCTURE"), new NamespaceSimpleName());
    const val = seq(new PassByValue(), optPrio(new FormParamType()));
    const field = seq(new Field(), optPrio(new FormParamType()));

    const ret = altPrio(stru, val, field);

    return ret;
  }
}