import {IStatement} from "./_statement";
import {verNot, seq, opts, pers} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class InsertReport implements IStatement {

  public getMatcher(): IStatementRunnable {
    const options = pers(seq("STATE", Source),
                         seq("EXTENSION TYPE", Source),
                         seq("DIRECTORY ENTRY", Source),
                         seq("UNICODE ENABLING", Source),
                         seq("PROGRAM TYPE", Source),
                         seq("FIXED-POINT ARITHMETIC", Source),
                         "KEEPING DIRECTORY ENTRY");

    const ret = seq("INSERT REPORT",
                    Source,
                    "FROM",
                    Source,
                    opts(options));

    return verNot(Version.Cloud, ret);
  }

}