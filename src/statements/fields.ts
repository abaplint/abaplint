import {Statement} from "./statement";
import {verNot, str, seq, IRunnable} from "../combi";
import {FieldSub} from "../expressions";
import {Version} from "../version";

export class Fields extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("FIELDS"), new FieldSub());

    return verNot(Version.Cloud, ret);
  }

}