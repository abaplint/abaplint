import {seq, optPrio, Expression, altPrio, ver} from "../combi";
import {TypeName, Default, FieldChain, LOBHandle, ComponentName} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";

export class Type extends Expression {
  public getRunnable(): IStatementRunnable {

    const indicators = seq("WITH INDICATORS", ComponentName, optPrio(seq("TYPE", TypeName)));

    const typeType = seq(TypeName, optPrio(Default));

    const like = altPrio(seq("LINE OF", FieldChain),
                         seq("REF TO", FieldChain),
                         FieldChain);

    const type = altPrio(seq("LINE OF", typeType),
                         seq("REF TO", typeType),
                         seq(typeType, optPrio(LOBHandle)));

    const ret = seq(altPrio(seq("LIKE", like), seq("TYPE", type)), optPrio(ver(Version.v755, indicators)));

    return ret;
  }
}