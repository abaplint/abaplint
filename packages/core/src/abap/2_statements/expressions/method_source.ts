import {seq, alt, tok, Expression, optPrio, altPrio, star} from "../combi";
import {Dash, InstanceArrow, StaticArrow} from "../../1_lexer/tokens";
import {ClassName, MethodName, Dynamic, AttributeName, SourceField, SourceFieldSymbol, ComponentName, MethodCall} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class MethodSource extends Expression {
  public getRunnable(): IStatementRunnable {
    /*
    const mname = alt(MethodName, Dynamic);
    const cname = alt(FieldChain, MethodCallChain, Dynamic);

    // this is a bit tricky, this part is required as FieldChain takes a AttributeName
    const stati = seq(ClassName, tok(StaticArrow), mname);

    const part1 = seq(cname, alt(tok(InstanceArrow), tok(StaticArrow)));

    return alt(stati, seq(starPrio(part1), mname));
    */

// ******************


    const arrow = alt(tok(InstanceArrow), tok(StaticArrow));
    const attr = seq(arrow, alt(AttributeName, MethodCall));
    const comp = seq(tok(Dash), ComponentName);
    const attrOrComp = alt(attr, comp);

//    const fields = star(altPrio(attr, comp));

//    const after = star(seq(fields, tok(InstanceArrow), alt(MethodName, Dynamic)));

//    const localVariable = seq(FieldChain, tok(InstanceArrow));
    const staticClass = seq(ClassName, tok(StaticArrow));

//    const ret = seq(optPrio(altPrio(localVariable, staticClass)), MethodCall, after);

    const actual = alt(MethodName, Dynamic);

    const clas = seq(staticClass, alt(AttributeName, MethodCall));

    const start = seq(altPrio(clas, SourceField, SourceFieldSymbol, Dynamic), star(attrOrComp), arrow);

    return seq(optPrio(alt(staticClass, start)), actual);
  }
}