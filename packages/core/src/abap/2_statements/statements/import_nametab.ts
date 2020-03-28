import {IStatement} from "./_statement";
import {verNot, str, seq} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class ImportNametab implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("IMPORT NAMETAB"),
                    new Target(),
                    new Target(),
                    str("ID"),
                    new Source());

    return verNot(Version.Cloud, ret);
  }

}