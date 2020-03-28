import {IStatement} from "./_statement";
import {verNot, str, seq, opt, per} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SetPFStatus implements IStatement {

  public getMatcher(): IStatementRunnable {
    const program = seq(str("OF PROGRAM"), new Source());

    const options = per(program,
                        str("IMMEDIATELY"),
                        seq(str("EXCLUDING"), new Source()));

    const ret = seq(str("SET PF-STATUS"),
                    new Source(),
                    opt(options));

    return verNot(Version.Cloud, ret);
  }

}