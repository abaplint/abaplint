import {Statement} from "./_statement";
import {verNot, str, seq, IRunnable} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../version";

export class Hide extends Statement {

  public getMatcher(): IRunnable {
    const ret = seq(str("HIDE"), new Source());

    return verNot(Version.Cloud, ret);
  }

}