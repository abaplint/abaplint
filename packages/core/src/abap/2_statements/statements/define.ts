import {IStatement} from "./_statement";
import {verNot, seq} from "../combi";
import {MacroName} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Define implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("DEFINE", MacroName);
    return verNot(Version.Cloud, ret);
  }

}