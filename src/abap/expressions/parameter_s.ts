import {str, seq, Reuse, IRunnable} from "../combi";
import {Field, Source} from "./";

export class ParameterS extends Reuse {
  public get_runnable(): IRunnable {
    return seq(new Field(), str("="), new Source());
  }
}