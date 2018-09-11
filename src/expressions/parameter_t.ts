import {str, seq, Reuse, IRunnable} from "../combi";
import {Target, Field} from "./";

export class ParameterT extends Reuse {
  public get_runnable(): IRunnable {
    return seq(new Field(), str("="), new Target());
  }
}