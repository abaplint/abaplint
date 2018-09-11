import {Statement} from "./statement";
import {str, alt, seq, IRunnable} from "../combi";
import {Source} from "../expressions";

export class PrintControl extends Statement {

  public static get_matcher(): IRunnable {
    let index = seq(str("INDEX-LINE"), new Source);
    let func = seq(str("FUNCTION"), new Source);

    return seq(str("PRINT-CONTROL"), alt(index, func));
  }

}