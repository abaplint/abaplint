import {seq, tok, altPrio, regex as reg, Expression, starPrios} from "../combi";
import {Plus} from "../../1_lexer/tokens";
import {SourceFieldSymbol, ArrowOrDash, ComponentName, SourceField} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class FieldOffset extends Expression {
  public getRunnable(): IStatementRunnable {
    const named = seq(altPrio(SourceField, SourceFieldSymbol),
                      starPrios(seq(ArrowOrDash, ComponentName)));

    const offset = seq(tok(Plus),
                       altPrio(reg(/^\d+$/), named));

    return offset;
  }
}