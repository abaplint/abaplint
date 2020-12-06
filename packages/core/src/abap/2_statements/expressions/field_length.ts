import {seq, optPrios, altPrios, tok, regex as reg, Expression, starPrios} from "../combi";
import {ParenLeft, ParenRightW, Plus} from "../../1_lexer/tokens";
import {SourceFieldSymbol, ComponentName, ArrowOrDash, SourceField} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class FieldLength extends Expression {
  public getRunnable(): IStatementRunnable {
    const named = seq(altPrios(SourceField, SourceFieldSymbol),
                      starPrios(seq(ArrowOrDash, ComponentName)));

    const normal = seq(optPrios(tok(Plus)),
                       altPrios(reg(/^\d+$/), named));

    const length = seq(tok(ParenLeft),
                       altPrios(normal, "*"),
                       tok(ParenRightW));

    return length;
  }
}