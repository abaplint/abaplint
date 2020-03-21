import {IStatement} from "./_statement";
import {verNot, str, seq, IStatementRunnable} from "../combi";
import {MacroName} from "../expressions";
import {Version} from "../../../version";

export class Define implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("DEFINE"), new MacroName());
    return verNot(Version.Cloud, ret);
  }

}