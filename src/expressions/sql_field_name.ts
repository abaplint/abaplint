import {regex as reg, Reuse, IRunnable} from "../combi";

export class SQLFieldName extends Reuse {
  public get_runnable(): IRunnable {
    return reg(/^[\w~]+$/);
  }
}