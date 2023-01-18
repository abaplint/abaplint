import {seq, alt, tok, Expression, altPrio, star} from "../combi";
import {Dash, InstanceArrow, StaticArrow} from "../../1_lexer/tokens";
import {ClassName, Dynamic, AttributeName, SourceField, SourceFieldSymbol, ComponentName, MethodCall} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class MethodSource extends Expression {
  public getRunnable(): IStatementRunnable {

// note: AttributeName can be both an attribute and a method name, the syntax check will tell
// note: its allowed to end with MethodCall, however if this is done it will give a syntax error via syntax check

    const afterArrow = alt(AttributeName, MethodCall, Dynamic);
    const arrow = alt(tok(InstanceArrow), tok(StaticArrow));
    const attr = seq(arrow, afterArrow);
    const comp = seq(tok(Dash), ComponentName);
    const attrOrComp = alt(attr, comp);
    const staticClass = seq(ClassName, tok(StaticArrow));
    const clas = seq(staticClass, afterArrow);

    const start = seq(altPrio(clas, SourceField, SourceFieldSymbol, Dynamic), star(attrOrComp));

    return start;
  }
}