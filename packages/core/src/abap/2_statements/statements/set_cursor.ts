import {IStatement} from "./_statement";
import {verNot, seqs, per, altPrio} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SetCursor implements IStatement {

  public getMatcher(): IStatementRunnable {
    const line = seqs("LINE", Source);
    const offset = seqs("OFFSET", Source);
    const field = seqs("FIELD", Source);
    const pos = seqs(Source, Source);
    const ret = seqs("SET CURSOR", altPrio(per(field, offset, line), pos));
    return verNot(Version.Cloud, ret);
  }

}