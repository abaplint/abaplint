import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, IRunnable} from "../combi";

export class FreeMemory extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("FREE MEMORY ID"), new Reuse.Source());
  }

}