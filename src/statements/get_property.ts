import {Statement} from "./statement";
import {str, seq, opt, IRunnable} from "../combi";
import {Source, ParameterListS, FieldSub} from "../expressions";

export class GetProperty extends Statement {

  public static get_matcher(): IRunnable {
    let exporting = seq(str("EXPORTING"), new ParameterListS());

    let ret = seq(str("GET PROPERTY OF"),
                  new FieldSub(),
                  new Source(),
                  str("="),
                  new Source(),
                  opt(str("NO FLUSH")),
                  opt(exporting));

    return ret;
  }

}