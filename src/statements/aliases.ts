import { Statement } from "./statement";
import * as Combi from "../combi";
import Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;

export class Aliases extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("ALIASES"), Reuse.field(), str("FOR"), Reuse.field());
  }

}