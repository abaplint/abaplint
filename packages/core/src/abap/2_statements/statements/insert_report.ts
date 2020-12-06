import {IStatement} from "./_statement";
import {verNot, seqs, opts, pers} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class InsertReport implements IStatement {

  public getMatcher(): IStatementRunnable {
    const options = pers(seqs("STATE", Source),
                         seqs("EXTENSION TYPE", Source),
                         seqs("DIRECTORY ENTRY", Source),
                         seqs("UNICODE ENABLING", Source),
                         seqs("PROGRAM TYPE", Source),
                         seqs("FIXED-POINT ARITHMETIC", Source),
                         "KEEPING DIRECTORY ENTRY");

    const ret = seqs("INSERT REPORT",
                     Source,
                     "FROM",
                     Source,
                     opts(options));

    return verNot(Version.Cloud, ret);
  }

}