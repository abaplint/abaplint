import {plus, Reuse, IRunnable} from "../combi";
import {ParameterT} from "./";

export class ParameterListT extends Reuse {
  public get_runnable(): IRunnable {
    return plus(new ParameterT());
  }
}