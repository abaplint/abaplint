import {seqs, altPrios, starPrios, tok, Expression} from "../combi";
import {ClassName, Field, ComponentName} from ".";
import {StaticArrow, Dash} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";
import {AttributeName} from "./attribute_name";

export class SimpleFieldChain extends Expression {
  public getRunnable(): IStatementRunnable {
    const chain = starPrios(seqs(tok(Dash), ComponentName));

    const clas = seqs(ClassName, tok(StaticArrow), new AttributeName());
    const start = altPrios(clas, Field);

    const ret = seqs(start, chain);

    return ret;
  }
}