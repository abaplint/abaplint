import {seq, Expression, optPrio, plusPrio} from "../combi";
import {ClassName, Field, MethodParamName} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class EventHandler extends Expression {
  public getRunnable(): IStatementRunnable {
    const event = seq("FOR EVENT",
                      Field,
                      "OF",
                      ClassName,
                      optPrio(seq("IMPORTING", plusPrio(MethodParamName))));

    return event;
  }
}