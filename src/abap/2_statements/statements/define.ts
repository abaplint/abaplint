import {IStatement} from "./_statement";
import {verNot, str, seq} from "../combi";
import {MacroName} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Define implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("DEFINE"), new MacroName());
    return verNot(Version.Cloud, ret);
  }

}