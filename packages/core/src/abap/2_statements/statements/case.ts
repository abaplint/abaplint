import {IStatement} from "./_statement";
import {str, seq, opt, ver} from "../combi";
import {Version} from "../../../version";
import {Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Case implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seq(str("CASE"),
               opt(ver(Version.v750, str("TYPE OF"))),
               new Source());
  }

}