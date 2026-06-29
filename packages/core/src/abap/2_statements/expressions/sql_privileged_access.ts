import {seq, Expression, verLang, optPrio} from "../combi";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {SQLSourceSimple} from "./sql_source_simple";

export class SQLPrivilegedAccess extends Expression {
  public getRunnable(): IStatementRunnable {
    const accessLevel = verLang(LanguageVersion.Cloud, seq("LEVEL", SQLSourceSimple));
    return seq("PRIVILEGED ACCESS", optPrio(accessLevel));
  }
}
