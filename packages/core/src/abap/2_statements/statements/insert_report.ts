import {IStatement} from "./_statement";
import {verNot, str, seq, opt, per} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class InsertReport implements IStatement {

  public getMatcher(): IStatementRunnable {
    const options = per(seq(str("STATE"), new Source()),
                        seq(str("EXTENSION TYPE"), new Source()),
                        seq(str("DIRECTORY ENTRY"), new Source()),
                        seq(str("UNICODE ENABLING"), new Source()),
                        seq(str("PROGRAM TYPE"), new Source()),
                        seq(str("FIXED-POINT ARITHMETIC"), new Source()),
                        str("KEEPING DIRECTORY ENTRY"));

    const ret = seq(str("INSERT REPORT"),
                    new Source(),
                    str("FROM"),
                    new Source(),
                    opt(options));

    return verNot(Version.Cloud, ret);
  }

}