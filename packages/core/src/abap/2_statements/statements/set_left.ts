import {IStatement} from "./_statement";
import {verNot, opts, seqs} from "../combi";
import {Version} from "../../../version";
import {Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class SetLeft implements IStatement {

  public getMatcher(): IStatementRunnable {
    const column = seqs("COLUMN", Source);
    return verNot(Version.Cloud, seqs("SET LEFT SCROLL-BOUNDARY", opts(column)));
  }

}