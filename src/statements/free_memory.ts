import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import {Source} from "../expressions";

export class FreeMemory extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("FREE MEMORY ID"), new Source());
  }

}