import { Statement } from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;

export class Leave extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("LEAVE"),
               opt(alt(str("TO CURRENT TRANSACTION"),
                       str("TO LIST-PROCESSING"),
                       str("LIST-PROCESSING"),
                       str("SCREEN"),
                       seq(str("TO TRANSACTION"), new Reuse.Source()),
                       str("PROGRAM"),
                       seq(str("TO SCREEN"), new Reuse.Source()))));
  }

}