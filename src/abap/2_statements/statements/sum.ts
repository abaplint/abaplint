import {Statement} from "./_statement";
import {verNot, str, IStatementRunnable} from "../combi";
import {Version} from "../../../version";

export class Sum extends Statement {

  public getMatcher(): IStatementRunnable {
    return verNot(Version.Cloud, str("SUM"));
  }

}