import {seqs, opts, plus, Expression} from "../combi";
import {ClassName, Field, MethodParamName} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class EventHandler extends Expression {
  public getRunnable(): IStatementRunnable {
    const event = seqs("FOR EVENT",
                       Field,
                       "OF",
                       ClassName,
                       opts(seqs("IMPORTING", plus(new MethodParamName()))));

    return event;
  }
}