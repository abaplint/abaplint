import { Statement } from "./statement";
import * as Combi from "../combi";
import Reuse from "./reuse";

let str  = Combi.str;
let seq  = Combi.seq;

export class Include extends Statement {

// todo, rename Reuse.field to Reuse.name?
  public static get_matcher(): Combi.IRunnable {
    return seq(str("INCLUDE"), Reuse.field());
  }

}