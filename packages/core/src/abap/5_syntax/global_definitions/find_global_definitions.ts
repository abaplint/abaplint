import {IRegistry} from "../../../_iregistry";
import {InterfaceDefinition} from "../../types/interface_definition";
import {ClassDefinition} from "../../types/class_definition";
import {CurrentScope} from "../_current_scope";
import * as Structures from "../../3_structures/structures";
import {Interface} from "../../../objects/interface";
import {Class} from "../../../objects/class";
import * as BasicTypes from "../../types/basic";
import {AbstractType} from "../../types/basic/_abstract_type";
import {IProgress} from "../../../progress";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {AuthorizationCheckField, DataElement, LockObject, Table, TableType, View} from "../../../objects";

// todo: rewrite all of this to use a graph based deterministic approach instead

// this makes sure to cache global interface and class definitions in the corresponding object
export class FindGlobalDefinitions {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  public run(progress?: IProgress) {
    const MAX_PASSES = 10;
    let lastPass = Number.MAX_SAFE_INTEGER;

    // the setDirty method in the objects clears the definitions
    let candidates: (Class | Interface)[] = [];
    for (const o of this.reg.getObjects()) {
      if ((o instanceof Interface || o instanceof Class) && o.getDefinition() === undefined) {
        candidates.push(o);
      } else if (o instanceof DataElement
          || o instanceof View
          || o instanceof TableType
          || o instanceof LockObject
          || o instanceof AuthorizationCheckField
          || o instanceof Table) {
        o.parseType(this.reg); // make sure the references are set after parsing finishes
      }
    }
    // make sure the sequence is always the same, disregarding the sequence they were added to the registry
    // this will hopefully make it easier to debug
    candidates.sort((a, b) => {return a.getName().localeCompare(b.getName());});

    for (let i = 1; i <= MAX_PASSES; i++) {
      progress?.set(candidates.length, "Global OO types, pass " + i);
      let thisPass = 0;
      const next: (Class | Interface)[] = [];
      for (const o of candidates) {
        progress?.tickSync("Global OO types(pass " + i + "), next pass: " + next.length);
        this.update(o);
        const untypedCount = this.countUntyped(o);
        if (untypedCount > 0) {
          next.push(o);
        }
        thisPass = thisPass + untypedCount;
      }

      candidates = next;

      if (lastPass === thisPass || thisPass === 0) {
        break;
      }
      lastPass = thisPass;
    }
  }

/////////////////////////////

  public countUntyped(obj: Interface | Class): number {
    const def = obj.getDefinition();
    if (def === undefined) {
      return 1;
    }

    let count = 0;
    for (const t of def.getTypeDefinitions().getAll()) {
      count = count + this.count(t.type.getType());
    }
    for (const a of def.getAttributes().getAll()) {
      count = count + this.count(a.getType());
    }
    for (const a of def.getAttributes().getConstants()) {
      count = count + this.count(a.getType());
    }

    for (const m of def.getMethodDefinitions().getAll()) {
      for (const p of m.getParameters().getAll()) {
        count = count + this.count(p.getType());
      }
    }
    for (const e of def.getEvents() || []) {
      for (const p of e.getParameters()) {
        count = count + this.count(p.getType());
      }
    }

    return count;
  }

  private count(type: TypedIdentifier | AbstractType): number {
    if (type instanceof BasicTypes.UnknownType || type instanceof BasicTypes.VoidType) {
      return 1;
    } else if (type instanceof BasicTypes.TableType) {
      return this.count(type.getRowType());
    } else if (type instanceof BasicTypes.DataReference) {
      return this.count(type.getType());
    } else if (type instanceof BasicTypes.StructureType) {
      let count = 0;
      for (const c of type.getComponents()) {
        count = count + this.count(c.type);
      }
      return count;
    }
    return 0;
  }

  private update(obj: Interface | Class) {
    const file = obj.getMainABAPFile();
    if (file === undefined) {
      obj.setDefinition(undefined);
      return;
    }

    const struc = file?.getStructure();
    if (struc === undefined) {
      obj.setDefinition(undefined);
      return;
    }

    const input = {
      filename: file.getFilename(),
      scope: CurrentScope.buildDefault(this.reg, obj),
      issues: [],
    };

    if (obj instanceof Interface) {
      const found = struc.findFirstStructure(Structures.Interface);
      if (found) {
        try {
          const def = new InterfaceDefinition(found, input);
          obj.setDefinition(def);
        } catch {
          obj.setDefinition(undefined);
        }
      } else {
        obj.setDefinition(undefined);
      }
    } else {
      const found = struc.findFirstStructure(Structures.ClassDefinition);
      if (found) {
        try {
          const def = new ClassDefinition(found, input);
          obj.setDefinition(def);
        } catch {
          obj.setDefinition(undefined);
        }
      } else {
        obj.setDefinition(undefined);
      }
    }
  }
}