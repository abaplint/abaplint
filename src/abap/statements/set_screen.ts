import {Statement} from "./statement";
import {verNot, str, seq, IRunnable} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../version";

export class SetScreen extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("SET SCREEN"), new Source());
    return verNot(Version.Cloud, ret);
  }

}