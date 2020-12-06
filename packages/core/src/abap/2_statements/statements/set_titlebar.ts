import {IStatement} from "./_statement";
import {verNot, seq, opts, pluss} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SetTitlebar implements IStatement {

  public getMatcher(): IStatementRunnable {
    const wit = seq("WITH", pluss(Source));

    const program = seq("OF PROGRAM", Source);

    const ret = seq("SET TITLEBAR", Source, opts(program), opts(wit));

    return verNot(Version.Cloud, ret);
  }

}