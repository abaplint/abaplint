import {Statement} from "./_statement";
import {verNot, str, seq, alt, IStatementRunnable} from "../combi";
import {Source, NamespaceSimpleName} from "../expressions";
import {Version} from "../../../version";

export class Controls extends Statement {

  public getMatcher(): IStatementRunnable {
    const tableview = seq(str("TABLEVIEW USING SCREEN"), new Source());
    const tabstrip = str("TABSTRIP");
    const type = seq(str("TYPE"), alt(tableview, tabstrip));
    const ret = seq(str("CONTROLS"), new NamespaceSimpleName(), type);

    return verNot(Version.Cloud, ret);
  }

}