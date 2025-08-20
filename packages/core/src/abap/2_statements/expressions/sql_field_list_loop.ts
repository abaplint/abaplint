import {seq, ver, Expression, optPrio, opt, alt, star, tok} from "../combi";
import {SQLFieldName, Dynamic, SQLField, SQLAsName, Constant, SimpleFieldChain2} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {SQLPath} from "./sql_path";
import {WAt} from "../../1_lexer/tokens";

// loop must include one field from the database table
export class SQLFieldListLoop extends Expression {
  public getRunnable(): IStatementRunnable {
    const comma = opt(ver(Version.v740sp05, ",", Version.OpenABAP));
    const as = seq("AS", SQLAsName);
    const someField = seq(SQLField, comma);
    const abap = ver(Version.v740sp05, seq(tok(WAt), SimpleFieldChain2), Version.OpenABAP);
    const fieldList = seq(star(someField), alt(SQLFieldName, abap, SQLPath, Constant), optPrio(as), comma, star(someField));

    const fields = alt("*", Dynamic, fieldList);
    return fields;
  }
}