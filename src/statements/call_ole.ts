import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, opt, regex, plus, IRunnable} from "../combi";

export class CallOLE extends Statement {

  public static get_matcher(): IRunnable {
    let fields = seq(regex(/^#?\w+$/), str("="), new Reuse.Source());

    let exporting = seq(str("EXPORTING"), plus(fields));

    let ret = seq(str("CALL METHOD OF"),
                  new Reuse.Source(),
                  new Reuse.Constant(),
                  opt(exporting));

    return ret;
  }

}