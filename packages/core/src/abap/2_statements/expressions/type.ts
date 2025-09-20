import {seq, optPrio, Expression, altPrio} from "../combi";
import {TypeName, Default, FieldChain, LOBHandle, ComponentName} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class Type extends Expression {
  public getRunnable(): IStatementRunnable {

    const indicators = seq("WITH INDICATORS", ComponentName, "TYPE", TypeName);

    const typeType = seq(TypeName, optPrio(Default));

    const like = altPrio(seq("LINE OF", FieldChain),
                         seq("REF TO", FieldChain),
                         FieldChain);

    const type = altPrio(seq("LINE OF", typeType),
                         seq("REF TO", typeType),
                         seq(typeType, optPrio(LOBHandle)));

    const ret = seq(altPrio(seq("LIKE", like), seq("TYPE", type)), optPrio(indicators));

    return ret;
  }
}