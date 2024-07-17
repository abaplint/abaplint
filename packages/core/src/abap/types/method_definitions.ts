import {MethodDefinition} from "./method_definition";
import {StructureNode} from "../nodes";
import * as Structures from "../3_structures/structures";
import {MethodDef} from "../2_statements/statements";
import {Visibility} from "../4_file_information/visibility";
import {IMethodDefinitions} from "./_method_definitions";
import {IMethodDefinition} from "./_method_definition";
import {SyntaxInput} from "../5_syntax/_syntax_input";

export class MethodDefinitions implements IMethodDefinitions {
  private readonly all: {[index: string]: IMethodDefinition} = {};

  public constructor(node: StructureNode, input: SyntaxInput) {
    this.all = {};
    this.parse(node, input);
  }

  public* getAll(): Generator<IMethodDefinition, void, undefined> {
    for (const a in this.all) {
      yield this.all[a];
    }
  }

  public getByName(name: string | undefined): IMethodDefinition | undefined {
    if (name === undefined) {
      return undefined;
    }

    return this.all[name.toUpperCase()];
  }

///////////////////////

  private parseInterface(node: StructureNode, input: SyntaxInput) {
    const defs = node.findAllStatements(MethodDef);
    for (const def of defs) {
      const m = new MethodDefinition(def, Visibility.Public, input);
      this.all[m.getName().toUpperCase()] = m;
    }
  }

  private parse(node: StructureNode, input: SyntaxInput) {
    const idef = node.findDirectStructure(Structures.Interface);
    if (idef) {
      return this.parseInterface(node, input);
    }

    const cdef = node.findDirectStructure(Structures.ClassDefinition);
    if (!cdef) {
      throw new Error("MethodDefinitions, expected ClassDefinition as part of input node");
    }

    const pri = cdef.findDirectStructure(Structures.PrivateSection);
    for (const def of pri?.findAllStatements(MethodDef) || []) {
      const m = new MethodDefinition(def, Visibility.Private, input);
      this.all[m.getName().toUpperCase()] = m;
    }

    const pro = node.findDirectStructure(Structures.ProtectedSection);
    for (const def of pro?.findAllStatements(MethodDef) || []) {
      const m = new MethodDefinition(def, Visibility.Protected, input);
      this.all[m.getName().toUpperCase()] = m;
    }

    const pub = node.findDirectStructure(Structures.PublicSection);
    for (const def of pub?.findAllStatements(MethodDef) || []) {
      const m = new MethodDefinition(def, Visibility.Public, input);
      this.all[m.getName().toUpperCase()] = m;
    }
  }

}