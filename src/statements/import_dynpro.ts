import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;

export class ImportDynpro extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("IMPORT DYNPRO"),
               new Reuse.Target(),
               new Reuse.Target(),
               new Reuse.Target(),
               new Reuse.Target(),
               str("ID"),
               new Reuse.Source());
  }

}