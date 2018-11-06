import {MethodDefinition, Scope} from "./method_definition";
import {StructureNode} from "../../abap/nodes";
import {ClassDefinition} from "../../abap/structures/class_definition";
import {PrivateSection} from "../../abap/structures";
import {MethodDef} from "../../abap/statements";

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
    return []; // todo
  }

  private parse(node: StructureNode) {
    let cdef = node.findFirstStructure(ClassDefinition);
    if (!cdef) {
      throw new Error("MethodDefinition, expected ClassDefinition as part of input node");
    }

    let pri = cdef.findFirstStructure(PrivateSection);
    if (pri) {
      let defs = pri.findAllStatements(MethodDef);
      for (let def of defs) {
        this.pri.push(new MethodDefinition(def, Scope.Private));
      }
    }
/*
    let pro = node.findFirstStructure(ProtectedSection);
    if (pro) {

    }

    let pub = node.findFirstStructure(PublicSection);
    if (pub) {

    }
    */
  }
}