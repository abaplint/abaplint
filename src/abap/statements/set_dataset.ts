import {Statement} from "./_statement";
import {verNot, str, seq, IRunnable} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../version";

export class SetDataset extends Statement {

  public getMatcher(): IRunnable {
    const ret = seq(str("SET DATASET"), new Source(), str("POSITION"), new Source());
    return verNot(Version.Cloud, ret);
  }

}