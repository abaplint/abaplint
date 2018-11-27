import {Statement} from "./_statement";
import {verNot, str, IStatementRunnable} from "../combi";
import {Version} from "../../version";

export class EndOfDefinition extends Statement {

  public getMatcher(): IStatementRunnable {
    const ret = str("END-OF-DEFINITION");
    return verNot(Version.Cloud, ret);
  }

}