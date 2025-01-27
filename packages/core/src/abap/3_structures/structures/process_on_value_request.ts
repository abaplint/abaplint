import {IStructure} from "./_structure";
import * as Statements from "../../2_statements/statements";
import {seq, sta, star} from "./_combi";
import {IStructureRunnable} from "./_structure_runnable";

export class ProcessOnValueRequest implements IStructure {

  public getMatcher(): IStructureRunnable {
    const pov = star(sta(Statements.Field));

    return seq(sta(Statements.ProcessOnValueRequest), pov);
  }

}