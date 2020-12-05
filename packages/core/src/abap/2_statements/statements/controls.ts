import {IStatement} from "./_statement";
import {verNot, str, seqs, alt} from "../combi";
import {Source, NamespaceSimpleName} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Controls implements IStatement {

  public getMatcher(): IStatementRunnable {
    const tableview = seqs("TABLEVIEW USING SCREEN", Source);
    const tabstrip = str("TABSTRIP");
    const type = seqs("TYPE", alt(tableview, tabstrip));
    const ret = seqs("CONTROLS", NamespaceSimpleName, type);

    return verNot(Version.Cloud, ret);
  }

}