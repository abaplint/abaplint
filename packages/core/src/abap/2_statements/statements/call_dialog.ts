import {IStatement} from "./_statement";
import {verNot, seq, opt, plus, optPrio, alt} from "../combi";
import {Field, FieldSub, Constant, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CallDialog implements IStatement {

  public getMatcher(): IStatementRunnable {
    const from = seq(FieldSub, optPrio(seq("FROM", Source)));
    const exporting = seq("EXPORTING", plus(from));

    const to = seq(Field, optPrio(seq("TO", Field)));
    const importing = seq("IMPORTING", plus(to));

    const ret = seq("CALL DIALOG",
                    alt(Constant, FieldSub),
                    opt(exporting),
                    opt(importing));

    return verNot(Version.Cloud, ret);
  }

}