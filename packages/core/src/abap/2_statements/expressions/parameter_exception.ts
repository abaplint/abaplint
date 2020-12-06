import {seqs, opts, altPrios, Expression} from "../combi";
import {ParameterName, SimpleName, Target} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class ParameterException extends Expression {
  public getRunnable(): IStatementRunnable {
    const name = altPrios("OTHERS", ParameterName);
    return seqs(name,
                "=",
                SimpleName,
                opts(seqs("MESSAGE", Target)));
  }
}