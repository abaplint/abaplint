import {IStatement} from "./_statement";
import {verNot, str, seq, opt} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class GetPFStatus implements IStatement {

  public getMatcher(): IStatementRunnable {
    const program = seq(str("PROGRAM"), new Source());
    const excl = seq(str("EXCLUDING"), new Source());

    const ret = seq(str("GET PF-STATUS"),
                    new Target(),
                    opt(program),
                    opt(excl));

    return verNot(Version.Cloud, ret);
  }

}