import {Statement} from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;

export class Window extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("WINDOW STARTING AT"),
               new Reuse.Source(),
               new Reuse.Source(),
               str("ENDING AT"),
               new Reuse.Source(),
               new Reuse.Source());
  }

}