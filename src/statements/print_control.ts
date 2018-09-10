import {Statement} from "./statement";
import {str, alt, seq, IRunnable} from "../combi";
import * as Reuse from "./reuse";

export class PrintControl extends Statement {

  public static get_matcher(): IRunnable {
    let index = seq(str("INDEX-LINE"), new Reuse.Source);
    let func = seq(str("FUNCTION"), new Reuse.Source);

    return seq(str("PRINT-CONTROL"), alt(index, func));
  }

}