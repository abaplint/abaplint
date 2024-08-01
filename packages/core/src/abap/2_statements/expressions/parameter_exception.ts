import {seq, altPrio, Expression, optPrio} from "../combi";
import {Integer, ParameterName, SimpleFieldChain, Target} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class ParameterException extends Expression {
  public getRunnable(): IStatementRunnable {
    const name = altPrio("OTHERS", ParameterName);
    return seq(name,
               "=",
               altPrio(Integer, SimpleFieldChain),
               optPrio(seq("MESSAGE", Target)));
  }
}