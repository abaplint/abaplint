import {seqs, optPrio, altPrio, str, tok, regex as reg, Expression, starPrio} from "../combi";
import {ParenLeft, ParenRightW, Plus} from "../../1_lexer/tokens";
import {SourceFieldSymbol, ComponentName, ArrowOrDash, SourceField} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class FieldLength extends Expression {
  public getRunnable(): IStatementRunnable {
    const named = seqs(altPrio(new SourceField(), new SourceFieldSymbol()),
                       starPrio(seqs(ArrowOrDash, ComponentName)));

    const normal = seqs(optPrio(tok(Plus)),
                        altPrio(reg(/^\d+$/), named));

    const length = seqs(tok(ParenLeft),
                        altPrio(normal, str("*")),
                        tok(ParenRightW));

    return length;
  }
}