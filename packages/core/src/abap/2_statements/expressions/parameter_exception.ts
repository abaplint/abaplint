import {seq, altPrio, Expression, optPrio} from "../combi";
import {ParameterName, SimpleName, Target} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class ParameterException extends Expression {
  public getRunnable(): IStatementRunnable {
    const name = altPrio("OTHERS", ParameterName);
    return seq(name,
               "=",
               SimpleName,
               optPrio(seq("MESSAGE", Target)));
  }
}