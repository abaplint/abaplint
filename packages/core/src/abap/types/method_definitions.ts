import {MethodDefinition} from "./method_definition";
import {StructureNode} from "../../abap/nodes";
import {ClassDefinition} from "../3_structures/structures/class_definition";
import * as Structures from "../3_structures/structures";
import {MethodDef} from "../2_statements/statements";
import {Visibility} from "./visibility";
import {CurrentScope} from "../5_syntax/_current_scope";
import {IMethodDefinitions} from "./_method_definitions";

export class MethodDefinitions implements IMethodDefinitions {
  private readonly pri: MethodDefinition[];
  private readonly pub: MethodDefinition[];
  private readonly pro: MethodDefinition[];
  private readonly filename: string;

  public constructor(node: StructureNode, filename: string, scope: CurrentScope) {
    this.pri = [];
    this.pub = [];
    this.pro = [];
    this.filename = filename;
    this.parse(node, scope);
  }

  public getPublic(): MethodDefinition[] {
    return this.pub;
  }

  public getProtected(): MethodDefinition[] {
    return this.pro;
  }

  public getPrivate(): MethodDefinition[] {
    return this.pri;
  }

  public getAll(): MethodDefinition[] {
    return this.pub.concat(this.pro).concat(this.pri);
  }

///////////////////////

  private parse(node: StructureNode, scope: CurrentScope) {
    const cdef = node.findFirstStructure(ClassDefinition);
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