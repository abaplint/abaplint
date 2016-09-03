import { Statement } from "./statement";
import * as Combi from "../combi";
import Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;

export class Case extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("CASE"), Reuse.source());
  }

  public isStructure() {
    return true;
  }

}