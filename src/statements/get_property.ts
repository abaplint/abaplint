import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, opt, IRunnable} from "../combi";

export class GetProperty extends Statement {

  public static get_matcher(): IRunnable {
    let exporting = seq(str("EXPORTING"), new Reuse.ParameterListS());

    let ret = seq(str("GET PROPERTY OF"),
                  new Reuse.FieldSub(),
                  new Reuse.Source(),
                  str("="),
                  new Reuse.Source(),
                  opt(str("NO FLUSH")),
                  opt(exporting));

    return ret;
  }

}