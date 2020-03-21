import {seq, str, opt, plus, Expression, IStatementRunnable} from "../combi";
import {ClassName, Field, MethodParamName} from ".";

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