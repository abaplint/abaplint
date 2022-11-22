import {seq, Expression, optPrio, plusPrio} from "../combi";
import {ClassName, EventName, MethodParamName} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class EventHandler extends Expression {
  public getRunnable(): IStatementRunnable {
    const event = seq("FOR EVENT",
                      EventName,
                      "OF",
                      ClassName,
                      optPrio(seq("IMPORTING", plusPrio(MethodParamName))));

    return event;
  }
}