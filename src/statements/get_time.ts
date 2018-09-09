import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, alt, opt, IRunnable} from "../combi";

export class GetTime extends Statement {

  public static get_matcher(): IRunnable {
    let options = seq(alt(str("STAMP FIELD"), str("FIELD")), new Reuse.Target());
    return seq(str("GET TIME"), opt(options));
  }

}