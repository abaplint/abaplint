import {Statement} from "./_statement";
import {verNot, str, IStatementRunnable} from "../combi";
import {Version} from "../../../version";

export class EndOn extends Statement {

  public getMatcher(): IStatementRunnable {
    const ret = str("ENDON");
    return verNot(Version.Cloud, ret);
  }

}