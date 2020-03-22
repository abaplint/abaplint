import {seq, altPrio, optPrio, Expression} from "../combi";
import {PassByValue, FormParamType, Field} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class FormParam extends Expression {
  public getRunnable(): IStatementRunnable {
    const field = seq(altPrio(new PassByValue(), new Field()),
                      optPrio(new FormParamType()));

    return field;
  }
}