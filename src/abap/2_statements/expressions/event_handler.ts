import {seq, str, opt, plus, Expression} from "../combi";
import {ClassName, Field, MethodParamName} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class EventHandler extends Expression {
  public getRunnable(): IStatementRunnable {
    const event = seq(str("FOR EVENT"),
                      new Field(),
                      str("OF"),
                      new ClassName(),
                      opt(seq(str("IMPORTING"), plus(new MethodParamName()))));

    return event;
  }
}