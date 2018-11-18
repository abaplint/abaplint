import * as Statements from "../statements";
import {Structure} from "./_structure";
import {star, IStructureRunnable, sta, seq, sub} from "./_combi";
import {Normal} from "./normal";

export class Catch extends Structure {

  public getMatcher(): IStructureRunnable {
    const normal = star(sub(new Normal()));
    const cat = seq(sta(Statements.Catch), normal);

    return cat;
  }

}