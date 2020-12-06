import {alts, seq, optPrios, Expression, vers, tok} from "../combi";
import {SQLAsName, Dynamic, SQLCDSParameters, DatabaseTable, FieldChain} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";
import {WAt} from "../../1_lexer/tokens";

export class SQLFromSource extends Expression {
  public getRunnable(): IStatementRunnable {
    // https://help.sap.com/doc/abapdocu_752_index_htm/7.52/en-US/abennews-752-open_sql.htm#!ABAP_MODIFICATION_1@1@
    const tab = vers(Version.v752, seq(tok(WAt), FieldChain));
    const aas = seq("AS", SQLAsName);

    return seq(alts(Dynamic, seq(DatabaseTable, optPrios(SQLCDSParameters)), tab),
               optPrios(vers(Version.v752, "WITH PRIVILEGED ACCESS")),
               optPrios(aas));
  }
}