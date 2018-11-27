import {str, seq, Expression, IStatementRunnable} from "../combi";
import {Field, Source} from "./";

export class ParameterS extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(new Field(), str("="), new Source());
  }
}