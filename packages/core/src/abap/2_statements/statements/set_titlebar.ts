import {IStatement} from "./_statement";
import {verNot, seqs, opts, plus} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SetTitlebar implements IStatement {

  public getMatcher(): IStatementRunnable {
    const wit = seqs("WITH", plus(new Source()));

    const program = seqs("OF PROGRAM", Source);

    const ret = seqs("SET TITLEBAR", Source, opts(program), opts(wit));

    return verNot(Version.Cloud, ret);
  }

}