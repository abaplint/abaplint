import {Statement} from "./_statement";
import {verNot, str, seq, IRunnable} from "../combi";
import {Field} from "../expressions";
import {Version} from "../../version";

export class Tables extends Statement {

  public getMatcher(): IRunnable {
    const ret = seq(str("TABLES"), new Field());

    return verNot(Version.Cloud, ret);
  }

}