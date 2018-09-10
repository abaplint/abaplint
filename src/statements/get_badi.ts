import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, opt, IRunnable} from "../combi";
import {Target} from "../expressions";

export class GetBadi extends Statement {

  public static get_matcher(): IRunnable {
    let filters = seq(str("FILTERS"), new Reuse.ParameterListS());
    let context = seq(str("CONTEXT"), new Reuse.Source());
    let type = seq(str("TYPE"), new Reuse.Dynamic());

    let ret = seq(str("GET BADI"),
                  new Target(),
                  opt(type),
                  opt(filters),
                  opt(context));

    return ret;
  }

}