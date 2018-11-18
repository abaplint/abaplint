import {Statement} from "./_statement";
import {verNot, str, seq, IRunnable} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../version";

export class Position extends Statement {

  public getMatcher(): IRunnable {
    const ret = seq(str("POSITION"), new Source());

    return verNot(Version.Cloud, ret);
  }

}