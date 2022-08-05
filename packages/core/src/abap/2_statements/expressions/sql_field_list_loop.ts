import {seq, ver, Expression, optPrio, opt, alt, star} from "../combi";
import {SQLFieldName, Dynamic, SQLField, SQLAsName} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {SQLPath} from "./sql_path";

// loop must include one field from the database table
export class SQLFieldListLoop extends Expression {
  public getRunnable(): IStatementRunnable {
    const comma = opt(ver(Version.v740sp05, ","));
    const as = seq("AS", SQLAsName);
    const someField = seq(SQLField, comma);
    const fieldList = seq(star(someField), alt(SQLFieldName, SQLPath), optPrio(as), comma, star(someField));

    const fields = alt("*", Dynamic, fieldList);
    return fields;
  }
}