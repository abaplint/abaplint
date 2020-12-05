import {IStatement} from "./_statement";
import {verNot, seqs} from "../combi";
import {Field} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class BreakId implements IStatement {

  public getMatcher(): IStatementRunnable {
    const id = seqs("ID", Field);

    const ret = seqs("BREAK-POINT", id);

    return verNot(Version.Cloud, ret);
  }

}