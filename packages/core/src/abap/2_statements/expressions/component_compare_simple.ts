import {seq, plus, altPrio, Expression, alt, ver} from "../combi";
import {Dynamic, SimpleSource2, Source} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {ComponentChainSimple} from "./component_chain_simple";
import {Version} from "../../../version";

export class ComponentCompareSimple extends Expression {
  public getRunnable(): IStatementRunnable {
    const source = alt(SimpleSource2, ver(Version.v740sp02, Source, Version.OpenABAP));
    const ret = seq(altPrio(ComponentChainSimple, Dynamic), "=", source);
    return plus(ret);
  }
}