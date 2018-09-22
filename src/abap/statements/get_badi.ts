import {Statement} from "./statement";
import {verNot, str, seq, opt, IRunnable} from "../combi";
import {Target, ParameterListS, Source, Dynamic} from "../expressions";
import {Version} from "../../version";

export class GetBadi extends Statement {

  public static get_matcher(): IRunnable {
    let filters = seq(str("FILTERS"), new ParameterListS());
    let context = seq(str("CONTEXT"), new Source());
    let type = seq(str("TYPE"), new Dynamic());

    let ret = seq(str("GET BADI"),
                  new Target(),
                  opt(type),
                  opt(filters),
                  opt(context));

    return verNot(Version.Cloud, ret);
  }

}