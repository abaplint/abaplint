import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";
import {Dynamic} from "../expressions/dynamic";
import {ReferenceType} from "../_reference";
import {AnyType, GenericObjectReferenceType, ObjectReferenceType, UnknownType, VoidType} from "../../types/basic";
import {ClassDefinition, InterfaceDefinition} from "../../types";
import {StatementSyntax} from "../_statement_syntax";
import {IClassDefinition} from "../../types/_class_definition";
import {ObjectOriented} from "../_object_oriented";
import {TypeUtils} from "../_type_utils";

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
    for (const s of node.findDirectExpressions(Expressions.Source)) {
      new Source().runSyntax(s, scope, filename);
    }

    let first = true;
    for (const t of node.findAllExpressions(Expressions.Target)) {
      const found = new Target().runSyntax(t, scope, filename);
      if (first === true) {
        first = false;
        if (found instanceof VoidType) {
          continue;
        } else if (found instanceof UnknownType) {
          throw new Error("Target type unknown, " + t.concatTokens());
        } else if (!(found instanceof ObjectReferenceType)
            && !(found instanceof AnyType)
            && !(found instanceof GenericObjectReferenceType)) {
          throw new Error("Target must be an object reference, " + t.concatTokens());
        } else if (found instanceof GenericObjectReferenceType && type === undefined) {
          throw new Error("Generic type, cannot be instantiated");
        } else if (found instanceof ObjectReferenceType) {
          const id = found.getIdentifier();
          if (id instanceof InterfaceDefinition && type === undefined) {
            throw new Error("Interface reference, cannot be instantiated");
          } else if (found instanceof ObjectReferenceType
              && type === undefined
              && scope.findInterfaceDefinition(found.getQualifiedName())) {
            throw new Error("Interface reference, cannot be instantiated");
          } else if (id instanceof ClassDefinition && cdef === undefined) {
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

    this.validateParameters(cdef, node, scope, filename);
  }

  private validateParameters(cdef: IClassDefinition | undefined, node: StatementNode, scope: CurrentScope, filename: string) {
    if (cdef === undefined) {
      return;
    }

    const methodDef = new ObjectOriented(scope).searchMethodName(cdef, "CONSTRUCTOR");
    const methodParameters = methodDef.method?.getParameters();

    const allImporting = methodParameters?.getImporting() || [];
    const requiredImporting = new Set(methodParameters?.getRequiredParameters().map(i => i.getName().toUpperCase()));

    for (const p of node.findDirectExpression(Expressions.ParameterListS)?.findAllExpressions(Expressions.ParameterS) || []) {
      const name = p.findDirectExpression(Expressions.ParameterName)?.concatTokens().toUpperCase();
      if (name === undefined) {
        continue;
      }

      const source = p.findDirectExpression(Expressions.Source);
      const sourceType = new Source().runSyntax(source, scope, filename);

      const found = allImporting?.find(p => p.getName().toUpperCase() === name);
      if (found === undefined) {
        throw new Error(`constructor parameter "${name}" does not exist`);
      } else if (new TypeUtils(scope).isAssignableStrict(sourceType, found.getType()) === false) {
        throw new Error(`Method parameter "${name}" type not compatible`);
      }

      requiredImporting.delete(name);
    }

    for (const r of requiredImporting.values()) {
      throw new Error(`constructor parameter "${r}" must be supplied`);
    }
  }
}