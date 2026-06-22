import {seq, Expression, optPrio, altPrio, plusPrio, ver, star, AlsoIn} from "../combi";
import {Source, Let, For, FieldAssignment, ValueBodyLine, ValueBase} from ".";
import {Release} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class ValueBody extends Expression {
  public getRunnable(): IStatementRunnable {
    const strucOrTab = seq(optPrio(Let), optPrio(ValueBase), star(For), plusPrio(altPrio(FieldAssignment, ValueBodyLine)));

    const tabdef = ver(Release.v740sp08, altPrio("OPTIONAL", seq("DEFAULT", Source)), {also: AlsoIn.OpenABAP});

    return optPrio(altPrio(strucOrTab, seq(Source, optPrio(tabdef))));
  }
}