import {IStatement} from "./_statement";
import {verNot, seqs} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SetLanguage implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seqs("SET LANGUAGE", Source);

    return verNot(Version.Cloud, ret);
  }

}