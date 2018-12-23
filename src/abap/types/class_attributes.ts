import * as Structures from "../../abap/structures";
import * as Statements from "../../abap/statements";
import {ClassAttribute} from "./class_attribute";
import {ClassConstant} from "./class_constant";
import {StructureNode} from "../../abap/nodes";
import {Scope} from "./scope";


export class ClassAttributes {
  private static: ClassAttribute[];
  private instance: ClassAttribute[];
  private constants: ClassConstant[];

  constructor(node: StructureNode) {
    this.static = [];
    this.instance = [];
    this.constants = [];
    this.parse(node);
  }

  public getStatic(): ClassAttribute[] {
    return this.static;
  }

  public getInstance(): ClassAttribute[] {
    return this.instance;
  }

  public getConstants(): ClassConstant[] {
    return this.constants;
  }

  private parse(node: StructureNode): void {
    const cdef = node.findFirstStructure(Structures.ClassDefinition);
    if (!cdef) {
      throw new Error("MethodDefinition, expected ClassDefinition as part of input node");
    }

    this.parseSection(cdef.findFirstStructure(Structures.PublicSection), Scope.Public);
    this.parseSection(cdef.findFirstStructure(Structures.PrivateSection), Scope.Private);
    this.parseSection(cdef.findFirstStructure(Structures.ProtectedSection), Scope.Protected);
  }

  private parseSection(node: StructureNode | undefined, scope: Scope): void {
    if (!node) { return; }

    let defs = node.findAllStatements(Statements.Data);
    for (const def of defs) {
      this.instance.push(new ClassAttribute(def, scope));
    }

    defs = node.findAllStatements(Statements.ClassData);
    for (const def of defs) {
      this.static.push(new ClassAttribute(def, scope));
    }

// todo, handle constants
  }

}