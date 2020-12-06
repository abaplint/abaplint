import {IStatement} from "./_statement";
import {verNot, seqs, opts} from "../combi";
import {Source, SimpleName, FieldSub} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Ranges implements IStatement {

  public getMatcher(): IStatementRunnable {
    const occurs = seqs("OCCURS", Source);

    const ret = seqs("RANGES",
                     SimpleName,
                     "FOR",
                     FieldSub,
                     opts(occurs));

    return verNot(Version.Cloud, ret);
  }

}