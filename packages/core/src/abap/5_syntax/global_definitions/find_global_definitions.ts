import {IRegistry} from "../../../_iregistry";
import {ABAPObject} from "../../../objects/_abap_object";
import {InterfaceDefinition} from "../../types/interface_definition";
import {ClassDefinition} from "../../types/class_definition";
import {CurrentScope} from "../_current_scope";
import * as Structures from "../../3_structures/structures";
import {Interface} from "../../../objects/interface";
import {Class} from "../../../objects/class";

// this makes sure to cache global interface and class definitions in the corresponding object
export class FindGlobalDefinitions {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  public run() {
// todo, do proper counting in a incremental/multi-pass typing, in case of cross references
    for (let i = 0; i < 3; i++) {
      for (const o of this.reg.getObjects()) {
        if (o instanceof ABAPObject) {
          this.runPrivate(o);
        }
      }
    }
  }

  private runPrivate(obj: ABAPObject) {
    const file = obj.getMainABAPFile();
    const struc = file?.getStructure();

    if (obj instanceof Interface) {
      if (struc && file) {
        const def = new InterfaceDefinition(struc, file.getFilename(), CurrentScope.buildDefault(this.reg));
        obj.setDefinition(def);
      } else {
        obj.setDefinition(undefined);
      }
    }

    if (obj instanceof Class) {
      const found = struc?.findFirstStructure(Structures.ClassDefinition);
      if (struc && file && found) {
        const def = new ClassDefinition(found, file.getFilename(), CurrentScope.buildDefault(this.reg));
        obj.setDefinition(def);
      } else {
        obj.setDefinition(undefined);
      }
    }
  }
}