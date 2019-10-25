import {Statement} from "./_statement";
import {verNot, str, seq, optPrio, IStatementRunnable} from "../combi";
import {Select, SQLTarget} from "../expressions";
import {Version} from "../../version";

export class OpenCursor extends Statement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("OPEN CURSOR"),
                    optPrio(str("WITH HOLD")),
                    new SQLTarget(),
                    str("FOR"),
                    new Select());

    return verNot(Version.Cloud, ret);
  }

}