import {Statement} from "./_statement";
import {verNot, str, seq, opt, IStatementRunnable} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../version";

export class Reject extends Statement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("REJECT"), opt(new Source()));

    return verNot(Version.Cloud, ret);
  }

}