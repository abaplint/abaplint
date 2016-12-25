import {Statement} from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;

export class Aliases extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("ALIASES"),
               new Reuse.Field(),
               str("FOR"),
               new Reuse.Field());
  }

}