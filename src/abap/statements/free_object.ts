import {Statement} from "./statement";
import {verNot, str, seq, opt, IRunnable} from "../combi";
import {Target} from "../expressions";
import {Version} from "../../version";

export class FreeObject extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("FREE OBJECT"),
                  new Target(),
                  opt(str("NO FLUSH")));

    return verNot(Version.Cloud, ret);
  }

}