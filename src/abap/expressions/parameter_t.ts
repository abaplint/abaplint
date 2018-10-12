import {str, seq, Expression, IRunnable} from "../combi";
import {Target, Field} from "./";

export class ParameterT extends Expression {
  public getRunnable(): IRunnable {
    return seq(new Field(), str("="), new Target());
  }
}