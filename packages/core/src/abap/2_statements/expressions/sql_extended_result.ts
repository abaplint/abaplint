import {seq, Expression, tok, regex as reg} from "../combi";
import {WAt} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class SQLExtendedResult extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq("EXTENDED RESULT", tok(WAt), reg(/^\w+$/));
  }
}
