import {MethodDefinition} from "./method_definition";
import {StructureNode} from "../../abap/nodes";
import {ClassDefinition} from "../../abap/structures/class_definition";
import * as Structures from "../../abap/structures";
import {MethodDef} from "../../abap/statements";
import {Visibility} from "./visibility";

export class MethodDefinitions {
  private pri: MethodDefinition[];
  private pub: MethodDefinition[];
  private pro: MethodDefinition[];

  public constructor(node: StructureNode) {
    this.pri = [];
    this.pub = [];
    this.pro = [];
    this.parse(node);
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

  private parse(node: StructureNode) {
    const cdef = node.findFirstStructure(ClassDefinition);
    if (!cdef) {
      throw new Error("MethodDefinitions, expected ClassDefinition as part of input node");
    }

    const pri = cdef.findFirstStructure(Structures.PrivateSection);
    if (pri) {
      const defs = pri.findAllStatements(MethodDef);
      for (const def of defs) {
        this.pri.push(new MethodDefinition(def, Visibility.Private));
      }
    }

    const pro = node.findFirstStructure(Structures.ProtectedSection);
    if (pro) {
      const defs = pro.findAllStatements(MethodDef);
      for (const def of defs) {
        this.pro.push(new MethodDefinition(def, Visibility.Protected));
      }
    }

    const pub = node.findFirstStructure(Structures.PublicSection);
    if (pub) {
      const defs = pub.findAllStatements(MethodDef);
      for (const def of defs) {
        this.pub.push(new MethodDefinition(def, Visibility.Public));
      }
    }
  }
}