import {IStatement} from "./_statement";
import {verNot, seqs, opts, pluss, optPrios} from "../combi";
import {Field, FieldSub, Constant, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CallDialog implements IStatement {

  public getMatcher(): IStatementRunnable {
    const from = seqs(FieldSub, optPrios(seqs("FROM", Source)));
    const exporting = seqs("EXPORTING", pluss(from));

    const to = seqs(Field, optPrios(seqs("TO", Field)));
    const importing = seqs("IMPORTING", pluss(to));

    const ret = seqs("CALL DIALOG",
                     Constant,
                     opts(exporting),
                     opts(importing));

    return verNot(Version.Cloud, ret);
  }

}