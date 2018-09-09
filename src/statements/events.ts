import {Statement} from "./statement";
import {str, seq, opt, alt, plus, IRunnable} from "../combi";
import * as Reuse from "./reuse";

export class Events extends Statement {

  public static get_matcher(): IRunnable {
    let par = seq(new Reuse.MethodParam(), opt(str("OPTIONAL")));

    let exporting = seq(str("EXPORTING"), plus(par));

    return seq(alt(str("CLASS-EVENTS"), str("EVENTS")), new Reuse.Field(), opt(exporting));
  }

}