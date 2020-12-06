import {seqs, optPrios, altPrios, str, tok, regex as reg, Expression, starPrios} from "../combi";
import {ParenLeft, ParenRightW, Plus} from "../../1_lexer/tokens";
import {SourceFieldSymbol, ComponentName, ArrowOrDash, SourceField} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class FieldLength extends Expression {
  public getRunnable(): IStatementRunnable {
    const named = seqs(altPrios(SourceField, SourceFieldSymbol),
                       starPrios(seqs(ArrowOrDash, ComponentName)));

    const normal = seqs(optPrios(tok(Plus)),
                        altPrios(reg(/^\d+$/), named));

    const length = seqs(tok(ParenLeft),
                        altPrios(normal, str("*")),
                        tok(ParenRightW));

    return length;
  }
}