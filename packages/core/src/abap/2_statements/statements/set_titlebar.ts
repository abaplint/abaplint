import {IStatement} from "./_statement";
import {verNot, seq, opt, plus} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SetTitlebar implements IStatement {

  public getMatcher(): IStatementRunnable {
    const wit = seq("WITH", plus(Source));

    const program = seq("OF PROGRAM", Source);

    const ret = seq("SET TITLEBAR", Source, opt(program), opt(wit));

    return verNot(Version.Cloud, ret);
  }

}