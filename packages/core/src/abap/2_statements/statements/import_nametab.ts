import {IStatement} from "./_statement";
import {verNot, seq} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class ImportNametab implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("IMPORT NAMETAB",
                    Target,
                    Target,
                    "ID",
                    Source);

    return verNot(Version.Cloud, ret);
  }

}