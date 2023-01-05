import {seq, altPrio, tok, Expression, star} from "../combi";
import {ClassName, ComponentName, SourceField, SourceFieldSymbol} from ".";
import {StaticArrow, Dash, InstanceArrow} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";
import {AttributeName} from "./attribute_name";

export class SimpleFieldChain2 extends Expression {
  public getRunnable(): IStatementRunnable {
    const attr = seq(tok(InstanceArrow), AttributeName);
    const comp = seq(tok(Dash), ComponentName);

    const chain = star(altPrio(attr, comp));

    const clas = seq(ClassName, tok(StaticArrow), AttributeName);
    const start = altPrio(clas, SourceField, SourceFieldSymbol);

    const ret = seq(start, chain);

    return ret;
  }
}