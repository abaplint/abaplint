import {regex as reg, Reuse, IRunnable} from "../combi";

export class Modif extends Reuse {
  public get_runnable(): IRunnable {
    return reg(/^\w{1,3}$/);
  }
}