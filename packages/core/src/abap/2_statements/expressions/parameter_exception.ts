import {seqs, opt, str, altPrio, Expression} from "../combi";
import {ParameterName, SimpleName, Target} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class ParameterException extends Expression {
  public getRunnable(): IStatementRunnable {
    const name = altPrio(str("OTHERS"), new ParameterName());
    return seqs(name,
                "=",
                SimpleName,
                opt(seqs("MESSAGE", Target)));
  }
}