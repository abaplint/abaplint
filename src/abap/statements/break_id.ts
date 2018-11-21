import {Statement} from "./_statement";
import {verNot, str, seq, IRunnable} from "../combi";
import {Field} from "../expressions";
import {Version} from "../../version";

export class BreakId extends Statement {

  public getMatcher(): IRunnable {
    const id = seq(str("ID"), new Field());

    const ret = seq(str("BREAK-POINT"), id);

    return verNot(Version.Cloud, ret);
  }

}