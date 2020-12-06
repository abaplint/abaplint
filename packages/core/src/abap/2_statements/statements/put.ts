import {IStatement} from "./_statement";
import {verNot, seqs} from "../combi";
import {Version} from "../../../version";
import {Field} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Put implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seqs("PUT", Field);

    return verNot(Version.Cloud, ret);
  }

}