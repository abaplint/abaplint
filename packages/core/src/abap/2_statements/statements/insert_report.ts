import {IStatement} from "./_statement";
import {verNot, str, seqs, opts, per} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class InsertReport implements IStatement {

  public getMatcher(): IStatementRunnable {
    const options = per(seqs("STATE", Source),
                        seqs("EXTENSION TYPE", Source),
                        seqs("DIRECTORY ENTRY", Source),
                        seqs("UNICODE ENABLING", Source),
                        seqs("PROGRAM TYPE", Source),
                        seqs("FIXED-POINT ARITHMETIC", Source),
                        str("KEEPING DIRECTORY ENTRY"));

    const ret = seqs("INSERT REPORT",
                     Source,
                     "FROM",
                     Source,
                     opts(options));

    return verNot(Version.Cloud, ret);
  }

}