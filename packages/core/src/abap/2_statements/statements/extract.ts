import {IStatement} from "./_statement";
import {verNot, seq, opt} from "../combi";
import {Field} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Extract implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("EXTRACT", opt(Field));

    return verNot(Version.Cloud, ret);
  }

}