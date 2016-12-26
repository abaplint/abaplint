import {Statement} from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let alt = Combi.alt;
let seq = Combi.seq;

export class PrintControl extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let index = seq(str("INDEX-LINE"), new Reuse.Source);
    let func = seq(str("FUNCTION"), new Reuse.Source);

    return seq(str("PRINT-CONTROL"), alt(index, func));
  }

}