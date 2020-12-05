import {str, alt, seqs, optPrio, Expression, ver, tok} from "../combi";
import {SQLAsName, Dynamic, SQLCDSParameters, DatabaseTable, FieldChain} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";
import {WAt} from "../../1_lexer/tokens";

export class SQLFromSource extends Expression {
  public getRunnable(): IStatementRunnable {
    // https://help.sap.com/doc/abapdocu_752_index_htm/7.52/en-US/abennews-752-open_sql.htm#!ABAP_MODIFICATION_1@1@
    const tab = ver(Version.v752, seqs(tok(WAt), FieldChain));
    const aas = seqs("AS", SQLAsName);

    return seqs(alt(new Dynamic(), seqs(DatabaseTable, optPrio(new SQLCDSParameters())), tab),
                optPrio(ver(Version.v752, str("WITH PRIVILEGED ACCESS"))),
                optPrio(aas));
  }
}