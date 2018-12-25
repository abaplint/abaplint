import {Statement} from "./_statement";
import {verNot, str, IStatementRunnable} from "../combi";
import {Version} from "../../version";

export class EndAt extends Statement {

  public getMatcher(): IStatementRunnable {
    const ret = str("ENDAT");
    return verNot(Version.Cloud, ret);
  }

}