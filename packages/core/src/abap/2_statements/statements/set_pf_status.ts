import {IStatement} from "./_statement";
import {verNot, seq, opt, per} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SetPFStatus implements IStatement {

  public getMatcher(): IStatementRunnable {
    const program = seq("OF PROGRAM", Source);

    const options = per(program,
                        "IMMEDIATELY",
                        seq("EXCLUDING", Source));

    const ret = seq("SET PF-STATUS",
                    Source,
                    opt(options));

    return verNot(Version.Cloud, ret);
  }

}