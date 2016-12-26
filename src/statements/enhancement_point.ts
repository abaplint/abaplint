import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;

export class EnhancementPoint extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("ENHANCEMENT-POINT"),
               new Reuse.FieldSub(),
               str("SPOTS"),
               new Reuse.Field(),
               opt(str("STATIC")),
               opt(str("INCLUDE BOUND")));
  }

}