import {plus, Reuse, IRunnable} from "../combi";
import {ParameterS} from "./";

export class ParameterListS extends Reuse {
  public get_runnable(): IRunnable {
    return plus(new ParameterS());
  }
}