import {Statement} from "./_statement";
import {verNot, str, IRunnable} from "../combi";
import {Version} from "../../version";

export class EndOfSelection extends Statement {

  public getMatcher(): IRunnable {
    const ret = str("END-OF-SELECTION");

    return verNot(Version.Cloud, ret);
  }

}