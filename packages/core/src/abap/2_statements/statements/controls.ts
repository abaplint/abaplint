import {IStatement} from "./_statement";
import {verNot, seqs, alts} from "../combi";
import {Source, NamespaceSimpleName} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Controls implements IStatement {

  public getMatcher(): IStatementRunnable {
    const tableview = seqs("TABLEVIEW USING SCREEN", Source);
    const type = seqs("TYPE", alts(tableview, "TABSTRIP"));
    const ret = seqs("CONTROLS", NamespaceSimpleName, type);

    return verNot(Version.Cloud, ret);
  }

}