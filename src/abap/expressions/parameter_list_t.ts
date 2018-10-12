import {plus, Expression, IRunnable} from "../combi";
import {ParameterT} from "./";

export class ParameterListT extends Expression {
  public getRunnable(): IRunnable {
    return plus(new ParameterT());
  }
}