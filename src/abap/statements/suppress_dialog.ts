import {Statement} from "./_statement";
import {verNot, str, IRunnable} from "../combi";
import {Version} from "../../version";

export class SuppressDialog extends Statement {

  public getMatcher(): IRunnable {
    const ret = str("SUPPRESS DIALOG");

    return verNot(Version.Cloud, ret);
  }

}