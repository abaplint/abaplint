import {IStatement} from "./_statement";
import {verNot, seqs} from "../combi";
import {MacroName} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Define implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seqs("DEFINE", MacroName);
    return verNot(Version.Cloud, ret);
  }

}