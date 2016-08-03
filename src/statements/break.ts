import { Statement } from "./statement";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;

export class Break extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return alt(str("BREAK-POINT"), seq(str("BREAK"), Reuse.field()));
  }

}