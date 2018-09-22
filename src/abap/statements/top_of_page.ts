import {Statement} from "./statement";
import {verNot, str, opt, seq, IRunnable} from "../combi";
import {Version} from "../../version";

export class TopOfPage extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("TOP-OF-PAGE"), opt(str("DURING LINE-SELECTION")));

    return verNot(Version.Cloud, ret);
  }

}