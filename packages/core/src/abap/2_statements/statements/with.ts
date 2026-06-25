import {IStatement} from "./_statement";
import {seq, ver, tok, star, optPrio, altPrio, verNotLang} from "../combi";
import {Release, LanguageVersion} from "../../../version";
import {Select, SelectCTE, WithName, SQLCTEAssociations, SQLCTEHierarchy} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";

export class With implements IStatement {

  public getMatcher(): IStatementRunnable {
    const exposing = optPrio(seq("WITH", altPrio(new SQLCTEHierarchy(), SQLCTEAssociations)));
    const cte = seq(WithName, "AS", tok(WParenLeftW), SelectCTE, tok(WParenRightW), exposing);
    return verNotLang(LanguageVersion.KeyUser, ver(Release.v751, seq("WITH", cte, star(seq(",", cte)), Select)));
  }

}