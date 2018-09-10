import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import * as Reuse from "./reuse";

export class Window extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("WINDOW STARTING AT"),
               new Reuse.Source(),
               new Reuse.Source(),
               str("ENDING AT"),
               new Reuse.Source(),
               new Reuse.Source());
  }

}