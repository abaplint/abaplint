import * as Structures from ".";
import {IStructure} from "./_structure";
import * as Statements from "../../2_statements/statements";
import {seq, sub, star, sta} from "./_combi";
import {IStructureRunnable} from "./_structure_runnable";

export class ClassGlobal implements IStructure {

  public getMatcher(): IStructureRunnable {
    return seq(star(sta(Statements.TypePools)),
               sub(Structures.ClassDefinition),
               sub(Structures.ClassImplementation));
  }

}