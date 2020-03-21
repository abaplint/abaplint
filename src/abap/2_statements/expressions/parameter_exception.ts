import {seq, opt, str, altPrio, Expression, IStatementRunnable} from "../combi";
import {ParameterName, SimpleName, Target} from ".";

export class ParameterException extends Expression {
  public getRunnable(): IStatementRunnable {
    const name = altPrio(str("OTHERS"), new ParameterName());
    return seq(name,
               str("="),
               new SimpleName(),
               opt(seq(str("MESSAGE"), new Target())));
  }
}