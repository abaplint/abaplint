import {LanguageVersion, Release} from "../../../version";
import {alt, seq, Expression, ver, verNotLang, optPrio, starPrio} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {SQLSourceSimple} from "./sql_source_simple";
import {SQLAliasField} from "./sql_alias_field";
import {Dynamic} from "./dynamic";

export class SQLClient extends Expression {
  public getRunnable(): IStatementRunnable {
    const clientList = ver(Release.v740sp05, alt(Dynamic, seq(SQLAliasField, starPrio(seq(",", SQLAliasField)))));

    const client = alt(verNotLang(LanguageVersion.Cloud, seq("CLIENT SPECIFIED", optPrio(clientList))),
                       seq("USING", alt(ver(Release.v740sp05, seq("CLIENT", SQLSourceSimple)),
                                        ver(Release.v754, seq("CLIENTS IN", alt(SQLSourceSimple, "T000"))),
                                        ver(Release.v754, "ALL CLIENTS"))));
    return client;
  }
}
