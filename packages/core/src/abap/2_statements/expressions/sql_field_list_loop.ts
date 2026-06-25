import {seq, ver, Expression, optPrio, opt, alt, star, tok, AlsoIn} from "../combi";
import {SQLFieldName, Dynamic, SQLField, SQLAsName, Constant, SimpleFieldChain2} from ".";
import {Release} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {SQLPathForColumn} from "./sql_path_for_column";
import {WAt} from "../../1_lexer/tokens";

// loop must include one field from the database table
export class SQLFieldListLoop extends Expression {
  public getRunnable(): IStatementRunnable {
    const comma = opt(ver(Release.v740sp05, ",", {also: AlsoIn.OpenABAP}));
    const as = seq("AS", SQLAsName);
    const someField = seq(SQLField, comma);
    const abap = ver(Release.v740sp05, seq(tok(WAt), SimpleFieldChain2), {also: AlsoIn.OpenABAP});
    const fieldList = seq(star(someField), alt(SQLFieldName, abap, SQLPathForColumn, Constant), optPrio(as), comma, star(someField));

    const fields = alt("*", Dynamic, fieldList);
    return fields;
  }
}