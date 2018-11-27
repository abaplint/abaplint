import {Statement} from "./_statement";
import {verNot, str, seq, IStatementRunnable} from "../combi";
import {Target} from "../expressions";
import {Version} from "../../version";

export class Free extends Statement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("FREE"), new Target());

    return verNot(Version.Cloud, ret);
  }

}