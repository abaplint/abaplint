import { Statement } from "./statement";
import * as Combi from "../combi";
import Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;

export class Leave extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("LEAVE"),
               alt(str("PROGRAM"),
                   seq(str("TO SCREEN"), Reuse.integer())));
  }

}