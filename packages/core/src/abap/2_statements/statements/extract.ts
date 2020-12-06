import {IStatement} from "./_statement";
import {verNot, seq, opts} from "../combi";
import {Field} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Extract implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("EXTRACT", opts(Field));

    return verNot(Version.Cloud, ret);
  }

}