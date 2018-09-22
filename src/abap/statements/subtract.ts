import {Statement} from "./statement";
import {verNot, str, seq, IRunnable} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../version";

export class Subtract extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("SUBTRACT"),
                  new Source(),
                  str("FROM"),
                  new Target());

    return verNot(Version.Cloud, ret);
  }

}