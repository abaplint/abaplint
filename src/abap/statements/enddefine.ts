import {Statement} from "./_statement";
import {verNot, str, IRunnable} from "../combi";
import {Version} from "../../version";

export class EndOfDefinition extends Statement {

  public getMatcher(): IRunnable {
    const ret = str("END-OF-DEFINITION");
    return verNot(Version.Cloud, ret);
  }

}