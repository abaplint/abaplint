import {IStatement} from "./_statement";
import {verNot, seq, alt} from "../combi";
import {Source, NamespaceSimpleName} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Controls implements IStatement {

  public getMatcher(): IStatementRunnable {
    const tableview = seq("TABLEVIEW USING SCREEN", Source);
    const type = seq("TYPE", alt(tableview, "TABSTRIP"));
    const ret = seq("CONTROLS", NamespaceSimpleName, type);

    return verNot(Version.Cloud, ret);
  }

}