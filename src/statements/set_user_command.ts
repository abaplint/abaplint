import {Statement} from "./statement";
import {verNot, str, seq, IRunnable} from "../combi";
import {Source} from "../expressions";
import {Version} from "../version";

export class SetUserCommand extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("SET USER-COMMAND"), new Source());

    return verNot(Version.Cloud, ret);
  }

}