import * as Statements from "../../2_statements/statements";
import {IStructure} from "./_structure";
import {sta, seq, sub, opt} from "./_combi";
import {Body} from "./body";
import {IStructureRunnable} from "./_structure_runnable";

export class Catch implements IStructure {

  public getMatcher(): IStructureRunnable {
    const cat = seq(sta(Statements.Catch), opt(sub(Body)));

    return cat;
  }

}