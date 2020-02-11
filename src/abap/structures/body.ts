import {Structure} from "./_structure";
import {star, sub} from "./_combi";
import {Normal} from "./normal";
import {IStructureRunnable} from "./_structure_runnable";

export class Body extends Structure {

  public getMatcher(): IStructureRunnable {
// todo, this should be a "plus" instead, however its not implemented yet
    return star(sub(new Normal()));
  }

}