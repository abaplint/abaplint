import {IStatement} from "./_statement";
import {verNot, str, seqs, opts, per} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SetPFStatus implements IStatement {

  public getMatcher(): IStatementRunnable {
    const program = seqs("OF PROGRAM", Source);

    const options = per(program,
                        str("IMMEDIATELY"),
                        seqs("EXCLUDING", Source));

    const ret = seqs("SET PF-STATUS",
                     Source,
                     opts(options));

    return verNot(Version.Cloud, ret);
  }

}