import {Statement} from "./_statement";
import {verNot, str, seq, IRunnable} from "../combi";
import {FieldSub} from "../expressions";
import {Version} from "../../version";

export class Fields extends Statement {

  public getMatcher(): IRunnable {
    const ret = seq(str("FIELDS"), new FieldSub());

    return verNot(Version.Cloud, ret);
  }

}