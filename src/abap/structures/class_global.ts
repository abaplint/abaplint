import * as Structures from "./";
import {Structure} from "./_structure";
import {seq, IStructureRunnable, sub} from "./_combi";

export class ClassGlobal extends Structure {

  public getMatcher(): IStructureRunnable {
    return seq(sub(new Structures.ClassDefinition()), sub(new Structures.ClassImplementation()));
  }

}