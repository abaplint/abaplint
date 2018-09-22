import {regex as reg, Reuse, IRunnable} from "../combi";

export class DatabaseTable extends Reuse {
  public get_runnable(): IRunnable {
    return reg(/^(\/\w+\/)?\w+$/);
  }
}