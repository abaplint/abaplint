import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, opt, IRunnable} from "../combi";

export class RaiseEvent extends Statement {

  public static get_matcher(): IRunnable {
    let exporting = seq(str("EXPORTING"), new Reuse.ParameterListS());

    return seq(str("RAISE EVENT"), new Reuse.Field(), opt(exporting));
  }

}