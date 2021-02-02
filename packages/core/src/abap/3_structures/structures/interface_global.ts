import * as Structures from ".";
import {IStructure} from "./_structure";
import * as Statements from "../../2_statements/statements";
import {seq, sub, star, sta} from "./_combi";
import {IStructureRunnable} from "./_structure_runnable";

export class InterfaceGlobal implements IStructure {

  public getMatcher(): IStructureRunnable {
    return seq(star(sta(Statements.TypePools)),
               star(sta(Statements.InterfaceLoad)),
               sub(Structures.Interface));
  }

}