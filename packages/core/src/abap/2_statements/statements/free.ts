import {IStatement} from "./_statement";
import {verNot, seqs} from "../combi";
import {Target} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Free implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seqs("FREE", Target);

    return verNot(Version.Cloud, ret);
  }

}