import {IStructure} from "./_structure";
import * as Statements from "../../2_statements/statements";
import {alt, opt, seq, sta, star} from "./_combi";
import {IStructureRunnable} from "./_structure_runnable";

export class DynproLogic implements IStructure {

  public getMatcher(): IStructureRunnable {
    const pai = star(alt(sta(Statements.Module), sta(Statements.Field), sta(Statements.CallSubscreen)));
    const pbo = star(alt(sta(Statements.Module), sta(Statements.Field), sta(Statements.CallSubscreen)));
    const pov = star(sta(Statements.Field));

    return seq(
      sta(Statements.ProcessBeforeOutput),
      pbo,
      sta(Statements.ProcessAfterInput),
      pai,
      opt(seq(sta(Statements.ProcessOnValueRequest), pov)),
    );
  }

}