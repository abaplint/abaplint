import {Statement} from "./_statement";
import {verNot, str, IRunnable} from "../combi";
import {Version} from "../../version";

export class Back extends Statement {

  public getMatcher(): IRunnable {
    const ret = str("BACK");

    return verNot(Version.Cloud, ret);
  }

}