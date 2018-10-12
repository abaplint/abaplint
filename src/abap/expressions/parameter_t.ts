import {str, seq, Expression, IRunnable} from "../combi";
import {Target, Field} from "./";

export class ParameterT extends Expression {
  public get_runnable(): IRunnable {
    return seq(new Field(), str("="), new Target());
  }
}