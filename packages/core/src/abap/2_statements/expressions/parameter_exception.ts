import {seq, opts, altPrios, Expression} from "../combi";
import {ParameterName, SimpleName, Target} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class ParameterException extends Expression {
  public getRunnable(): IStatementRunnable {
    const name = altPrios("OTHERS", ParameterName);
    return seq(name,
               "=",
               SimpleName,
               opts(seq("MESSAGE", Target)));
  }
}