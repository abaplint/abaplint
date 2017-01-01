import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;

export class Ranges extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let occurs = seq(str("OCCURS"), new Reuse.Source());

    return seq(str("RANGES"),
               new Reuse.SimpleName(),
               str("FOR"),
               new Reuse.FieldSub(),
               opt(occurs));
  }

}