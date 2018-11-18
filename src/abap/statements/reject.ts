import {Statement} from "./_statement";
import {verNot, str, seq, opt, IRunnable} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../version";

export class Reject extends Statement {

  public getMatcher(): IRunnable {
    const ret = seq(str("REJECT"), opt(new Source()));

    return verNot(Version.Cloud, ret);
  }

}