import * as Statements from "../../2_statements/statements";
import {IStructure} from "./_structure";
import {star, sta, seq, sub} from "./_combi";
import {Normal} from "./normal";
import {IStructureRunnable} from "./_structure_runnable";

export class When implements IStructure {

  public getMatcher(): IStructureRunnable {
    const when = seq(sta(Statements.When), star(sub(new Normal())));

    return when;
  }

}