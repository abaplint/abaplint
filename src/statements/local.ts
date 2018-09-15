import {Statement} from "./statement";
import {verNot, str, seq, IRunnable} from "../combi";
import {FieldSub} from "../expressions";
import {Version} from "../version";

export class Local extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("LOCAL"), new FieldSub());

    return verNot(Version.Cloud, ret);
  }

}