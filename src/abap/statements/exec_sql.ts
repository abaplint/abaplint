import {Statement} from "./_statement";
import {verNot, str, seq, opt, IRunnable} from "../combi";
import {SimpleName} from "../expressions";
import {Version} from "../../version";

export class ExecSQL extends Statement {

  public getMatcher(): IRunnable {
    const performing = seq(str("PERFORMING"), new SimpleName());

    const ret = seq(str("EXEC SQL"), opt(performing));

    return verNot(Version.Cloud, ret);
  }

}