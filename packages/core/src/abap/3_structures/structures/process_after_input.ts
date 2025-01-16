import {IStructure} from "./_structure";
import * as Statements from "../../2_statements/statements";
import {alt, seq, sta, star, sub} from "./_combi";
import {IStructureRunnable} from "./_structure_runnable";
import {Chain} from "./chain";

export class ProcessAfterInput implements IStructure {

  public getMatcher(): IStructureRunnable {
    const pai = star(alt(sta(Statements.Module), sta(Statements.Field), sta(Statements.CallSubscreen), sub(Chain)));

    return seq(
      sta(Statements.ProcessAfterInput),
      pai,
    );
  }

}