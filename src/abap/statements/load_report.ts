import {Statement} from "./statement";
import {verNot, str, seq, IRunnable} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../version";

export class LoadReport extends Statement {

  public get_matcher(): IRunnable {
    let ret = seq(str("LOAD REPORT"),
                  new Source(),
                  str("PART"),
                  new Source(),
                  str("INTO"),
                  new Target());

    return verNot(Version.Cloud, ret);
  }

}