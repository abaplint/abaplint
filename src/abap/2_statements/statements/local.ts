import {IStatement} from "./_statement";
import {verNot, str, seq, IStatementRunnable, opt} from "../combi";
import {FieldSub, TableBody} from "../expressions";
import {Version} from "../../../version";

export class Local implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("LOCAL"), new FieldSub(), opt(new TableBody()));

    return verNot(Version.Cloud, ret);
  }

}