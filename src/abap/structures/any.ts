// import * as Statements from "../statements";
import {star, sub, alt, IStructureRunnable} from "./_combi";
import * as Structures from "./";
import {Structure} from "./_structure";

export class Any extends Structure {

  public getMatcher(): IStructureRunnable {

    return star(alt(sub(new Structures.Normal()),
                    sub(new Structures.Interface()),
                    sub(new Structures.ClassDefinition()),
                    sub(new Structures.ClassImplementation())));

  }

}