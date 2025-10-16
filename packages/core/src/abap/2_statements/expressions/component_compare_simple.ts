import {seq, plus, altPrio, Expression, ver} from "../combi";
import {Dynamic, SimpleSource4, Source} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {ComponentChainSimple} from "./component_chain_simple";
import {Version} from "../../../version";

export class ComponentCompareSimple extends Expression {
  public getRunnable(): IStatementRunnable {
    const source = altPrio(ver(Version.v740sp02, Source, Version.OpenABAP), SimpleSource4);
    const ret = seq(altPrio(ComponentChainSimple, Dynamic), "=", source);
    return plus(ret);
  }
}