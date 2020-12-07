import {seq, opt, altPrio, Expression} from "../combi";
import {ParameterName, SimpleName, Target} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class ParameterException extends Expression {
  public getRunnable(): IStatementRunnable {
    const name = altPrio("OTHERS", ParameterName);
    return seq(name,
               "=",
               SimpleName,
               opt(seq("MESSAGE", Target)));
  }
}