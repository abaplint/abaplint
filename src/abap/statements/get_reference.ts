import {Statement} from "./statement";
import {verNot, str, seq, IRunnable} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../version";

export class GetReference extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("GET REFERENCE OF"),
                  new Source(),
                  str("INTO"),
                  new Target());

    return verNot(Version.Cloud, ret);
  }

}