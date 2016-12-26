import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;

export class EnhancementSection extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("ENHANCEMENT-SECTION"),
               new Reuse.Field(),
               str("SPOTS"),
               new Reuse.Field(),
               opt(str("STATIC")));
  }

}