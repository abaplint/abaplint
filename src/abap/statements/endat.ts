import {Statement} from "./_statement";
import {verNot, str, IRunnable} from "../combi";
import {Version} from "../../version";

export class Endat extends Statement {

  public getMatcher(): IRunnable {
    const ret = str("ENDAT");
    return verNot(Version.Cloud, ret);
  }

}