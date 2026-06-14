import {IStatement} from "./_statement";
import {seq, ver, tok, star} from "../combi";
import {Version} from "../../../version";
import {Select, SelectCTE, WithName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";

export class With implements IStatement {

  public getMatcher(): IStatementRunnable {
    const cte = seq(WithName, "AS", tok(WParenLeftW), SelectCTE, tok(WParenRightW));
    return ver(Version.v751, seq("WITH", cte, star(seq(",", cte)), Select));
  }

}