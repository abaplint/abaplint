import {seq, ver, Expression, optPrio, opt, altPrio, plusPrio, tok} from "../combi";
import {SQLFieldName, Dynamic, SQLField, SQLAsName, Constant, SimpleFieldChain2} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {SQLPath} from "./sql_path";
import {WAt} from "../../1_lexer/tokens";

export class SQLFieldListLoopGreedy extends Expression {
  public getRunnable(): IStatementRunnable {
    const comma = opt(ver(Version.v740sp05, ",", Version.OpenABAP));
    const as = seq("AS", SQLAsName);
    const abap = ver(Version.v740sp05, seq(tok(WAt), SimpleFieldChain2), Version.OpenABAP);
    const entry = seq(altPrio(SQLField, abap, SQLPath, SQLFieldName, Constant), optPrio(as), comma);
    const fieldList = plusPrio(entry);

    return altPrio("*", Dynamic, fieldList);
  }
}
