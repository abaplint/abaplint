import {IStatement} from "./_statement";
import {verNot, seqs} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Pack implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seqs("PACK", Source, "TO", Target);

    return verNot(Version.Cloud, ret);
  }

}