import {seq, altPrio, starPrio, tok, Expression} from "../combi";
import {ClassName, Field, ComponentName} from ".";
import {StaticArrow, Dash} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";
import {AttributeName} from "./attribute_name";

export class SimpleFieldChain extends Expression {
  public getRunnable(): IStatementRunnable {
    const chain = starPrio(seq(tok(Dash), ComponentName));

    const clas = seq(ClassName, tok(StaticArrow), AttributeName);
    const start = altPrio(clas, Field);

    const ret = seq(start, chain);

    return ret;
  }
}