import {IStatement} from "./_statement";
import {verNot, str, seq, altPrio, optPrio} from "../combi";
import {FieldSub, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Break implements IStatement {

  public getMatcher(): IStatementRunnable {
    const next = str("AT NEXT APPLICATION STATEMENT");

    const ret = altPrio(seq("BREAK-POINT", optPrio(altPrio(next, Source))),
                        seq("BREAK", FieldSub));

    return verNot(Version.Cloud, ret);
  }

}