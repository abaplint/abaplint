import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;

export class SubtractCorresponding extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("SUBTRACT-CORRESPONDING"),
               new Reuse.Source(),
               str("FROM"),
               new Reuse.Target());
  }

}