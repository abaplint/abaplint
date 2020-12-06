import {IStatement} from "./_statement";
import {verNot, seq, opt} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class GetPFStatus implements IStatement {

  public getMatcher(): IStatementRunnable {
    const program = seq("PROGRAM", Source);
    const excl = seq("EXCLUDING", Source);

    const ret = seq("GET PF-STATUS",
                    Target,
                    opt(program),
                    opt(excl));

    return verNot(Version.Cloud, ret);
  }

}