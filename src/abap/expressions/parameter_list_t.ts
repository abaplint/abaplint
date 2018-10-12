import {plus, Expression, IRunnable} from "../combi";
import {ParameterT} from "./";

export class ParameterListT extends Expression {
  public get_runnable(): IRunnable {
    return plus(new ParameterT());
  }
}