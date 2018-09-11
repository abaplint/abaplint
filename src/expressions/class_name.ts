import {regex as reg, Reuse, IRunnable} from "../combi";

export class ClassName extends Reuse {
  public get_runnable(): IRunnable {
    return reg(/^\w*(\/\w{3,}\/)?\w+$/);
  }
}