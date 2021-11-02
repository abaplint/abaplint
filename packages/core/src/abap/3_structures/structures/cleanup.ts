import * as Statements from "../../2_statements/statements";
import {IStructure} from "./_structure";
import {sta, seq, opt, sub} from "./_combi";
import {IStructureRunnable} from "./_structure_runnable";
import {Body} from "./body";

export class Cleanup implements IStructure {

  public getMatcher(): IStructureRunnable {
    const cleanup = seq(sta(Statements.Cleanup), opt(sub(Body)));
    return cleanup;
  }

}