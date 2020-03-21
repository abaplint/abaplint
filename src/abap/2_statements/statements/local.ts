import {IStatement} from "./_statement";
import {verNot, str, seq, opt} from "../combi";
import {FieldSub, TableBody} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Local implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("LOCAL"), new FieldSub(), opt(new TableBody()));

    return verNot(Version.Cloud, ret);
  }

}