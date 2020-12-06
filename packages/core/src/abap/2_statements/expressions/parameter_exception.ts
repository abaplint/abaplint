import {seqs, opt, altPrios, Expression} from "../combi";
import {ParameterName, SimpleName, Target} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class ParameterException extends Expression {
  public getRunnable(): IStatementRunnable {
    const name = altPrios("OTHERS", ParameterName);
    return seqs(name,
                "=",
                SimpleName,
                opt(seqs("MESSAGE", Target)));
  }
}