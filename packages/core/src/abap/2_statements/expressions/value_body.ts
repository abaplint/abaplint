import {seq, Expression, optPrio, altPrio, plusPrio, ver, star} from "../combi";
import {Source, Let, For, FieldAssignment, ValueBodyLine} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class ValueBody extends Expression {
  public getRunnable(): IStatementRunnable {
    const base = seq("BASE", Source);

    const strucOrTab = seq(optPrio(Let), optPrio(base), star(For), plusPrio(altPrio(FieldAssignment, ValueBodyLine)));

    const tabdef = ver(Version.v740sp08, altPrio("OPTIONAL", seq("DEFAULT", Source)));

    return optPrio(altPrio(strucOrTab, seq(Source, optPrio(tabdef))));
  }
}