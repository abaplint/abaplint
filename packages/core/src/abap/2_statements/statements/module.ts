import {IStatement} from "./_statement";
import {verNot, seqs, alts, opts} from "../combi";
import {FormName} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Module implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seqs("MODULE",
                     FormName,
                     opts(alts("INPUT", "OUTPUT")));

    return verNot(Version.Cloud, ret);
  }

}