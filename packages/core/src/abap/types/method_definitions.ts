import {MethodDefinition} from "./method_definition";
import {StructureNode} from "../nodes";
import * as Structures from "../3_structures/structures";
import {MethodDef} from "../2_statements/statements";
import {Visibility} from "../4_file_information/visibility";
import {CurrentScope} from "../5_syntax/_current_scope";
import {IMethodDefinitions} from "./_method_definitions";
import {IMethodDefinition} from "./_method_definition";

export class MethodDefinitions implements IMethodDefinitions {
  private readonly pri: IMethodDefinition[];
  private readonly pub: IMethodDefinition[];
  private readonly pro: IMethodDefinition[];
  private readonly filename: string;

  public constructor(node: StructureNode, filename: string, scope: CurrentScope) {
    this.pri = [];
    this.pub = [];
    this.pro = [];
    this.filename = filename;
    this.parse(node, scope);
  }

  public getPublic(): IMethodDefinition[] {
    return this.pub;
  }

  public getProtected(): IMethodDefinition[] {
    return this.pro;
  }

  public getPrivate(): IMethodDefinition[] {
    return this.pri;
  }

  public getAll(): readonly IMethodDefinition[] {
    return this.pub.concat(this.pro).concat(this.pri);
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
      this.pub.push(new MethodDefinition(def, Visibility.Public, this.filename, scope));
    }
  }

  private parse(node: StructureNode, scope: CurrentScope) {
    const idef = node.findFirstStructure(Structures.Interface);
    if (idef) {
      return this.parseInterface(node, scope);
    }

    const cdef = node.findFirstStructure(Structures.ClassDefinition);
    if (!cdef) {
      throw new Error("MethodDefinitions, expected ClassDefinition as part of input node");
    }

    const pri = cdef.findFirstStructure(Structures.PrivateSection);
    if (pri) {
      const defs = pri.findAllStatements(MethodDef);
      for (const def of defs) {
        this.pri.push(new MethodDefinition(def, Visibility.Private, this.filename, scope));
      }
    }

    const pro = node.findFirstStructure(Structures.ProtectedSection);
    if (pro) {
      const defs = pro.findAllStatements(MethodDef);
      for (const def of defs) {
        this.pro.push(new MethodDefinition(def, Visibility.Protected, this.filename, scope));
      }
    }

    const pub = node.findFirstStructure(Structures.PublicSection);
    if (pub) {
      const defs = pub.findAllStatements(MethodDef);
      for (const def of defs) {
        this.pub.push(new MethodDefinition(def, Visibility.Public, this.filename, scope));
      }
    }


  }

}