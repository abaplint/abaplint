import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";
import {Dynamic} from "../expressions/dynamic";
import {ReferenceType} from "../_reference";
import {GenericObjectReferenceType, ObjectReferenceType, VoidType} from "../../types/basic";
import {ClassDefinition} from "../../types";
import {StatementSyntax} from "../_statement_syntax";
import {IClassDefinition} from "../../types/_class_definition";

export class CreateObject implements StatementSyntax {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {

    let cdef: IClassDefinition | undefined = undefined;

    // CREATE OBJECT, TYPE
    const type = node.findExpressionAfterToken("TYPE");
    if (type && type.get() instanceof Expressions.ClassName) {
      const token = type.getFirstToken();
      const name = token.getStr();
      cdef = scope.findClassDefinition(name);
      if (cdef) {
        scope.addReference(token, cdef, ReferenceType.ObjectOrientedReference, filename);
        if (cdef.isAbstract() === true) {
          throw new Error(cdef.getName() + " is abstract, cannot be instantiated");
        }
      } else if (scope.getDDIC().inErrorNamespace(name) === false) {
        scope.addReference(token, undefined, ReferenceType.ObjectOrientedVoidReference, filename, {ooName: name, ooType: "CLAS"});
      } else {
        throw new Error("TYPE \"" + name + "\" not found");
      }
    }

    // just recurse
    for (const s of node.findAllExpressions(Expressions.Source)) {
      new Source().runSyntax(s, scope, filename);
    }

    let first = true;
    for (const t of node.findAllExpressions(Expressions.Target)) {
      const found = new Target().runSyntax(t, scope, filename);
      if (first === true) {
        first = false;
        if (found instanceof VoidType) {
          continue;
        } else if (!(found instanceof ObjectReferenceType)
            && !(found instanceof GenericObjectReferenceType)) {
          throw new Error("Target must be a object reference");
        } else if (found instanceof GenericObjectReferenceType && type === undefined) {
          throw new Error("Generic type, cannot be instantiated");
        } else if (found instanceof ObjectReferenceType) {
          const id = found.getIdentifier();
          if (id instanceof ClassDefinition) {
            cdef = id;
          }
          if (type === undefined && id instanceof ClassDefinition && id.isAbstract() === true) {
            throw new Error(id.getName() + " is abstract, cannot be instantiated");
          }
        }
      }
    }

    for (const t of node.findDirectExpressions(Expressions.Dynamic)) {
      new Dynamic().runSyntax(t, scope, filename);
    }

    this.validateParameters(cdef, node);
  }

  private validateParameters(cdef: IClassDefinition | undefined, node: StatementNode) {
    if (cdef === undefined) {
      return;
    }

// todo, search in super
    const methodParameters = cdef.getMethodDefinitions().getByName("CONSTRUCTOR")?.getParameters();

    const allImporting = methodParameters?.getImporting() || [];
    const requiredImporting = new Set(methodParameters?.getRequiredImporting().map(i => i.getName().toUpperCase()));

// todo, validate types
    for (const p of node.findDirectExpression(Expressions.ParameterListS)?.findAllExpressions(Expressions.ParameterS) || []) {
      const name = p.findDirectExpression(Expressions.ParameterName)?.concatTokens().toUpperCase();
      if (name === undefined) {
        continue;
      }

      if (allImporting?.some(p => p.getName().toUpperCase() === name) === false) {
        throw new Error(`constructor parameter "${name}" does not exist`);
      }
      requiredImporting.delete(name);
    }

    for (const r of requiredImporting.values()) {
      throw new Error(`constructor parameter "${r}" must be supplied`);
    }
  }
}