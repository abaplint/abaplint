import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import * as Reuse from "./reuse";

export class DeleteMemory extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("DELETE FROM MEMORY ID"), new Reuse.Source());
  }

}