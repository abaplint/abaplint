import { Statement } from "./statement";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;

export class Compute extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("COMPUTE"), Reuse.target(), str("="), Reuse.source());
  }

}