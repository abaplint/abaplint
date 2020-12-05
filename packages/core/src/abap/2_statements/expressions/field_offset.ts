import {seqs, tok, altPrio, regex as reg, Expression, starPrio} from "../combi";
import {Plus} from "../../1_lexer/tokens";
import {SourceFieldSymbol, ArrowOrDash, ComponentName, SourceField} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class FieldOffset extends Expression {
  public getRunnable(): IStatementRunnable {
    const named = seqs(altPrio(new SourceField(), new SourceFieldSymbol()),
                       starPrio(seqs(ArrowOrDash, ComponentName)));

    const offset = seqs(tok(Plus),
                        altPrio(reg(/^\d+$/), named));

    return offset;
  }
}