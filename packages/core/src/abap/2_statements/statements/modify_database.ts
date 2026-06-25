import {IStatement} from "./_statement";
import {seq, opt, alt, per, tok, optPrio, verNotLang} from "../combi";
import {DatabaseTable, SQLSource, Select, DatabaseConnection, SQLClient, SQLIndicators, SQLMappingFromEntity, SQLDmlOptions} from "../expressions";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class ModifyDatabase implements IStatement {

  public getMatcher(): IStatementRunnable {

    const sub = seq(tok(WParenLeftW), Select, tok(WParenRightW));
    const fromTable = seq("FROM", opt("TABLE"), SQLSource, optPrio(SQLIndicators), optPrio(SQLMappingFromEntity));
    const fromSubquery = seq("FROM", sub);
    const from = alt(fromTable, fromSubquery);

    const options = per(DatabaseConnection, from, SQLClient);

    return verNotLang(LanguageVersion.KeyUser,
                      seq("MODIFY", DatabaseTable, options, optPrio(SQLDmlOptions)));
  }

}
