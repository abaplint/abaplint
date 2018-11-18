import {Statement} from "./_statement";
import {verNot, str, IRunnable} from "../combi";
import {Version} from "../../version";

export class Detail extends Statement {
  public getMatcher(): IRunnable {
    const ret = str("DETAIL");

    return verNot(Version.Cloud, ret);
  }
}