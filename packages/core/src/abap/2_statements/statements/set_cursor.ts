import {IStatement} from "./_statement";
import {verNot, seq, per, altPrio} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SetCursor implements IStatement {

  public getMatcher(): IStatementRunnable {
    const line = seq("LINE", Source);
    const offset = seq("OFFSET", Source);
    const field = seq("FIELD", Source);
    const pos = seq(Source, Source);
    const ret = seq("SET CURSOR", altPrio(per(field, offset, line), pos));
    return verNot(Version.Cloud, ret);
  }

}