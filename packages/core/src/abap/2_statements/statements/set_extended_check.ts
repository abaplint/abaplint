import {IStatement} from "./_statement";
import {verNot, seqs, alts} from "../combi";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SetExtendedCheck implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seqs("SET EXTENDED CHECK", alts("OFF", "ON"));

    return verNot(Version.Cloud, ret);
  }

}