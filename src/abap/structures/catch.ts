import * as Statements from "../statements";
import {Structure} from "./_structure";
import {star, IStructureRunnable, sta, seq, sub} from "./_combi";
import {Normal} from "./normal";

export class Catch extends Structure {

  public getMatcher(): IStructureRunnable {
    let normal = star(sub(new Normal()));
    let cat = seq(sta(Statements.Catch), normal);

    return cat;
  }

}