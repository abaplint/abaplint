import {MethodDefinition} from "./method_definition";
import {StructureNode} from "../nodes";
import * as Structures from "../3_structures/structures";
import {MethodDef} from "../2_statements/statements";
import {Visibility} from "../4_file_information/visibility";
import {CurrentScope} from "../5_syntax/_current_scope";
import {IMethodDefinitions} from "./_method_definitions";
import {IMethodDefinition} from "./_method_definition";

export class MethodDefinitions implements IMethodDefinitions {
  private readonly all: IMethodDefinition[];
  private readonly filename: string;

  public constructor(node: StructureNode, filename: string, scope: CurrentScope) {
    this.all = [];
    this.filename = filename;
    this.parse(node, scope);
  }

  public* getAll(): Generator<IMethodDefinition, void, undefined> {
    for (const a of this.all) {
      yield a;
    }
  }

  public getByName(name: string | undefined): IMethodDefinition | undefined {
    if (name === undefined) {
      return undefined;
    }

    for (const m of this.getAll()) {
      if (m.getName().toUpperCase() === name.toUpperCase()) {
        return m;
      }
    }
    return undefined;
  }

///////////////////////

  private parseInterface(node: StructureNode, scope: CurrentScope) {
    const defs = node.findAllStatements(MethodDef);
    for (const def of defs) {
      this.all.push(new MethodDefinition(def, Visibility.Public, this.filename, scope));
    }
  }

  private parse(node: StructureNode, scope: CurrentScope) {
    const idef = node.findDirectStructure(Structures.Interface);
    if (idef) {
      return this.parseInterface(node, scope);
    }

    const cdef = node.findDirectStructure(Structures.ClassDefinition);
    if (!cdef) {
      throw new Error("MethodDefinitions, expected ClassDefinition as part of input node");
    }

    const pri = cdef.findDirectStructure(Structures.PrivateSection);
    if (pri) {
      const defs = pri.findAllStatements(MethodDef);
      for (const def of defs) {
        this.all.push(new MethodDefinition(def, Visibility.Private, this.filename, scope));
      }
    }

    const pro = node.findDirectStructure(Structures.ProtectedSection);
    if (pro) {
      const defs = pro.findAllStatements(MethodDef);
      for (const def of defs) {
        this.all.push(new MethodDefinition(def, Visibility.Protected, this.filename, scope));
      }
    }

    const pub = node.findDirectStructure(Structures.PublicSection);
    if (pub) {
      const defs = pub.findAllStatements(MethodDef);
      for (const def of defs) {
        this.all.push(new MethodDefinition(def, Visibility.Public, this.filename, scope));
      }
    }
  }

}