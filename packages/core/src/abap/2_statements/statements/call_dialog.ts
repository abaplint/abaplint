import {IStatement} from "./_statement";
import {verNot, seqs, opts, plus, optPrio} from "../combi";
import {Field, FieldSub, Constant, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CallDialog implements IStatement {

  public getMatcher(): IStatementRunnable {
    const from = seqs(FieldSub, optPrio(seqs("FROM", Source)));
    const exporting = seqs("EXPORTING", plus(from));

    const to = seqs(Field, optPrio(seqs("TO", Field)));
    const importing = seqs("IMPORTING", plus(to));

    const ret = seqs("CALL DIALOG",
                     Constant,
                     opts(exporting),
                     opts(importing));

    return verNot(Version.Cloud, ret);
  }

}