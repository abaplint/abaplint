import {seq, optPrio, altPrio, str, tok, regex as reg, Expression, starPrio} from "../combi";
import {ParenLeft, ParenRightW, Plus} from "../../1_lexer/tokens";
import {SourceFieldSymbol, ComponentName, ArrowOrDash, SourceField} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class FieldLength extends Expression {
  public getRunnable(): IStatementRunnable {
    const named = seq(altPrio(new SourceField(), new SourceFieldSymbol()),
                      starPrio(seq(new ArrowOrDash(), new ComponentName())));

    const normal = seq(optPrio(tok(Plus)),
                       altPrio(reg(/^\d+$/), named));

    const length = seq(tok(ParenLeft),
                       altPrio(normal, str("*")),
                       tok(ParenRightW));

    return length;
  }
}