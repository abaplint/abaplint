import {Statement} from "./_statement";
import {verNot, str, IRunnable} from "../combi";
import {Version} from "../../version";

export class EndOfPage extends Statement {

  public getMatcher(): IRunnable {
    const ret = str("END-OF-PAGE");

    return verNot(Version.Cloud, ret);
  }

}