import {seq, tok, altPrios, regex as reg, Expression, starPrios} from "../combi";
import {Plus} from "../../1_lexer/tokens";
import {SourceFieldSymbol, ArrowOrDash, ComponentName, SourceField} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class FieldOffset extends Expression {
  public getRunnable(): IStatementRunnable {
    const named = seq(altPrios(SourceField, SourceFieldSymbol),
                      starPrios(seq(ArrowOrDash, ComponentName)));

    const offset = seq(tok(Plus),
                       altPrios(reg(/^\d+$/), named));

    return offset;
  }
}