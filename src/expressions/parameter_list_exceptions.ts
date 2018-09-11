import {plus, Reuse, IRunnable} from "../combi";
import {ParameterException} from "./";

export class ParameterListExceptions extends Reuse {
  public get_runnable(): IRunnable {
    return plus(new ParameterException());
  }
}