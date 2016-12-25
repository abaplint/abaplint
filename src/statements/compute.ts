import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;

export class Compute extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("COMPUTE"),
               new Reuse.Target(),
               str("="),
               new Reuse.Source());
  }

}