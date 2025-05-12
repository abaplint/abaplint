import {IStructure} from "./_structure";
import * as Statements from "../../2_statements/statements";
import {alt, seq, sta, star, sub} from "./_combi";
import {IStructureRunnable} from "./_structure_runnable";
import {DynproLoop} from "./dynpro_loop";

export class ProcessBeforeOutput implements IStructure {

  public getMatcher(): IStructureRunnable {
    const pbo = star(alt(sta(Statements.Module), sta(Statements.Field), sta(Statements.CallSubscreen), sub(DynproLoop)));

    return seq(sta(Statements.ProcessBeforeOutput), pbo);
  }

}