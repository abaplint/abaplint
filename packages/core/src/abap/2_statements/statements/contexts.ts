import {IStatement} from "./_statement";
import {verNot, seqs} from "../combi";
import {Field} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Contexts implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seqs("CONTEXTS",
                     Field);

    return verNot(Version.Cloud, ret);
  }

}