import {SimpleFieldChain2} from ".";
import {Version} from "../../../version";
import {WAt} from "../../1_lexer/tokens";
import {Expression, ver, seq, tok, opt, altPrio} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {SQLFieldName} from "./sql_field_name";

export class SQLCast extends Expression {
  public getRunnable(): IStatementRunnable {
    const abap = ver(Version.v740sp05, seq(tok(WAt), SimpleFieldChain2), Version.OpenABAP);
// todo: from version something
    return seq("CAST", "(", opt(altPrio(SQLFieldName, abap)), "AS", SQLFieldName, ")");
  }
}