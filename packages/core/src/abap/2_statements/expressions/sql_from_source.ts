import {str, alt, seq, opt, Expression, ver, tok} from "../combi";
import {SQLAsName, Dynamic, SQLCDSParameters, DatabaseTable, FieldChain} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";
import {WAt} from "../../1_lexer/tokens";

export class SQLFromSource extends Expression {
  public getRunnable(): IStatementRunnable {
    // https://help.sap.com/doc/abapdocu_752_index_htm/7.52/en-US/abennews-752-open_sql.htm#!ABAP_MODIFICATION_1@1@
    const tab = ver(Version.v752, seq(tok(WAt), new FieldChain()));
    const aas = seq(str("AS"), new SQLAsName());

    return seq(alt(new Dynamic(), seq(new DatabaseTable(), opt(new SQLCDSParameters())), tab), opt(aas));
  }
}