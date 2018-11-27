import {str, seq, Expression, IStatementRunnable} from "../combi";
import {Target, Field} from "./";

export class ParameterT extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(new Field(), str("="), new Target());
  }
}