import {IRegistry} from "../../../_iregistry";
import {InterfaceDefinition} from "../../types/interface_definition";
import {ClassDefinition} from "../../types/class_definition";
import {CurrentScope} from "../_current_scope";
import * as Structures from "../../3_structures/structures";
import {Interface} from "../../../objects/interface";
import {Class} from "../../../objects/class";
import {UnknownType, VoidType} from "../../types/basic";
import {IMethodDefinition} from "../../types/_method_definition";

// this makes sure to cache global interface and class definitions in the corresponding object
export class FindGlobalDefinitions {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  public run() {
    this.clearAll();

    const MAX_PASSES = 3;
    let lastPass = Number.MAX_SAFE_INTEGER;

    for (let i = 0; i < MAX_PASSES; i++) {
      let thisPass = 0;
      for (const o of this.reg.getObjects()) {
        if (!(o instanceof Interface) && !(o instanceof Class)) {
          continue;
        }
        if (this.countUntyped(o) === 0) {
          continue;
        }
        this.update(o);

        thisPass = thisPass + this.countUntyped(o);
      }

      if (lastPass === thisPass || thisPass === 0) {
        break;
      }
      lastPass = thisPass;
    }
  }

/////////////////////////////

  private clearAll() {
    for (const o of this.reg.getObjects()) {
      if (o instanceof Interface || o instanceof Class) {
        o.setDefinition(undefined);
      }
    }
  }

  private countUntyped(obj: Interface | Class): number {
    const def = obj.getDefinition();
    if (def === undefined) {
      return 1;
    }

    // todo, count constants
    let count = 0;
    for (const t of def.getTypeDefinitions().getAll()) {
      if (t.getType() instanceof UnknownType || t.getType() instanceof VoidType) {
        count = count + 1;
      }
    }
    for (const a of def.getAttributes().getAll()) {
      if (a.getType() instanceof UnknownType || a.getType() instanceof VoidType) {
        count = count + 1;
      }
    }
    let methods: readonly IMethodDefinition[] = [];
    if (obj instanceof Interface) {
      methods = obj.getDefinition()!.getMethodDefinitions();
    } else {
      methods = obj.getDefinition()!.getMethodDefinitions().getAll();
    }
    for (const m of methods) {
      for (const p of m.getParameters().getAll()) {
        if (p.getType() instanceof UnknownType || p.getType() instanceof VoidType) {
          count = count + 1;
        }
      }
    }

    return count;
  }

  private update(obj: Interface | Class) {
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