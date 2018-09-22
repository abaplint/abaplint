import {regex as reg, Reuse, IRunnable} from "../combi";

export class MethodName extends Reuse {
  public get_runnable(): IRunnable {
    return reg(/^(\/\w+\/)?\w+(~\w+)?$/);
  }
}