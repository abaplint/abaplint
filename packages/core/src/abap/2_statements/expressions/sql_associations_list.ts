import {seq, star, tok, Expression, ver} from "../combi";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";
import {SQLAssociationEntry} from "./sql_association_entry";
import {Version} from "../../../version";

export class SQLAssociationsList extends Expression {
  public getRunnable(): IStatementRunnable {
    return ver(Version.v751, seq(
      tok(WParenLeftW),
      new SQLAssociationEntry(),
      star(seq(",", new SQLAssociationEntry())),
      tok(WParenRightW),
    ));
  }
}
