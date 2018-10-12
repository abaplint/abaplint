import {plus, Expression, IRunnable} from "../combi";
import {ParameterException} from "./";

export class ParameterListExceptions extends Expression {
  public get_runnable(): IRunnable {
    return plus(new ParameterException());
  }
}