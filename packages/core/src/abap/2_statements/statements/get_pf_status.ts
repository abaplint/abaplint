import {IStatement} from "./_statement";
import {verNot, seq, opts} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class GetPFStatus implements IStatement {

  public getMatcher(): IStatementRunnable {
    const program = seq("PROGRAM", Source);
    const excl = seq("EXCLUDING", Source);

    const ret = seq("GET PF-STATUS",
                    Target,
                    opts(program),
                    opts(excl));

    return verNot(Version.Cloud, ret);
  }

}