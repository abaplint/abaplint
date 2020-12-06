import {IStatement} from "./_statement";
import {verNot, seq, opt, pluss, optPrios} from "../combi";
import {Field, FieldSub, Constant, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CallDialog implements IStatement {

  public getMatcher(): IStatementRunnable {
    const from = seq(FieldSub, optPrios(seq("FROM", Source)));
    const exporting = seq("EXPORTING", pluss(from));

    const to = seq(Field, optPrios(seq("TO", Field)));
    const importing = seq("IMPORTING", pluss(to));

    const ret = seq("CALL DIALOG",
                    Constant,
                    opt(exporting),
                    opt(importing));

    return verNot(Version.Cloud, ret);
  }

}