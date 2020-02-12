import * as Statements from "../statements";
import {IStructure} from "./_structure";
import {star, sta, seq, sub} from "./_combi";
import {Normal} from "./normal";
import {IStructureRunnable} from "./_structure_runnable";

export class Catch implements IStructure {

  public getMatcher(): IStructureRunnable {
    const normal = star(sub(new Normal()));
    const cat = seq(sta(Statements.Catch), normal);

    return cat;
  }

}