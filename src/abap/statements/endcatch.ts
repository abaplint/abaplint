import {Statement} from "./_statement";
import {verNot, str, IStatementRunnable} from "../combi";
import {Version} from "../../version";

export class EndCatch extends Statement {

  public getMatcher(): IStatementRunnable {
    const ret = str("ENDCATCH");
    return verNot(Version.Cloud, ret);
  }

}