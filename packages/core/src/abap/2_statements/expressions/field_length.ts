import {seq, optPrio, altPrio, tok, regex as reg, Expression, starPrio} from "../combi";
import {ParenLeft, ParenRightW, Plus} from "../../1_lexer/tokens";
import {SourceFieldSymbol, ComponentName, ArrowOrDash, SourceField} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class FieldLength extends Expression {
  public getRunnable(): IStatementRunnable {
    const named = seq(altPrio(SourceField, SourceFieldSymbol),
                      starPrio(seq(ArrowOrDash, ComponentName)));

    const normal = seq(optPrio(tok(Plus)),
                       altPrio(reg(/^\d+$/), named));

    const length = seq(tok(ParenLeft),
                       altPrio(normal, "*"),
                       tok(ParenRightW));

    return length;
  }
}