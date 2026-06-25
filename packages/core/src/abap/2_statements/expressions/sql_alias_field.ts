import {Dash, WPlus} from "../../1_lexer/tokens";
import {regex as reg, Expression, seq, starPrio, tok, altPrio} from "../combi";
import {IStatementRunnable} from "../statement_runnable";

export class SQLAliasField extends Expression {
  public getRunnable(): IStatementRunnable {
    const aliasField = reg(/^(\/\w+\/)?\w+~(\/\w+\/)?\w+$/);
    const ctePrefixedAliasField = seq(tok(WPlus), aliasField);
    return seq(altPrio(ctePrefixedAliasField, aliasField),
               starPrio(seq(tok(Dash), reg(/^\w+$/))));
  }
}