import * as Structures from "./";
import {Structure} from "./_structure";
import {seq, IStructureRunnable} from "./_combi";

export class ClassGlobal extends Structure {

  public getMatcher(): IStructureRunnable {
    return seq(new Structures.ClassDefinition(), new Structures.ClassImplementation());
  }

}