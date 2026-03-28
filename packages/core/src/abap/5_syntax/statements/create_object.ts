import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";
import {Dynamic} from "../expressions/dynamic";
import {ReferenceType} from "../_reference";
import {AnyType, DataType, GenericObjectReferenceType, ObjectReferenceType, UnknownType, VoidType} from "../../types/basic";
import {ClassDefinition, InterfaceDefinition} from "../../types";
import {StatementSyntax} from "../_statement_syntax";
import {IClassDefinition} from "../../types/_class_definition";
import {ObjectOriented} from "../_object_oriented";
import {TypeUtils} from "../_type_utils";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";
import {Visibility} from "../../4_file_information/visibility";

export class CreateObject implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {

    let cdef: IClassDefinition | undefined = undefined;

    // CREATE OBJECT, TYPE
    const type = node.findExpressionAfterToken("TYPE");
    if (type && type.get() instanceof Expressions.ClassName) {
      const token = type.getFirstToken();
      const name = token.getStr();
      cdef = input.scope.findClassDefinition(name);
      if (cdef) {
        input.scope.addReference(token, cdef, ReferenceType.ObjectOrientedReference, input.filename);
        input.scope.addReference(token, cdef, ReferenceType.ConstructorReference, input.filename, {ooName: cdef.getName()});
        if (cdef.isAbstract() === true) {
          const message = cdef.getName() + " is abstract, cannot be instantiated";
          input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
          return;
        }
      } else if (input.scope.getDDIC().inErrorNamespace(name) === false) {
        input.scope.addReference(token, undefined, ReferenceType.ObjectOrientedVoidReference, input.filename, {ooName: name, ooType: "CLAS"});
      } else {
        const message = "TYPE \"" + name + "\" not found";
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      }
    }

    // just recurse
    for (const s of node.findDirectExpressions(Expressions.Source)) {
      Source.runSyntax(s, input);
    }

    for (const t of node.findDirectExpression(Expressions.ParameterListExceptions)?.findAllExpressions(Expressions.Target) || []) {
      Target.runSyntax(t, input);
    }

    const t = node.findDirectExpression(Expressions.Target);
    let found = undefined;
    if (t) {
      found = Target.runSyntax(t, input);
      if (found instanceof VoidType) {
        // do nothing
      } else if (found instanceof UnknownType) {
        const message = "Target type unknown, " + t.concatTokens();
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      } else if (!(found instanceof ObjectReferenceType)
          && !(found instanceof AnyType)
          && !(found instanceof DataType)
          && !(found instanceof GenericObjectReferenceType)) {
        const message = "Target must be an object reference, " + t.concatTokens();
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      } else if (found instanceof GenericObjectReferenceType && type === undefined) {
        const message = "Generic type, cannot be instantiated";
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      } else if (found instanceof ObjectReferenceType) {
        const identifier = found.getIdentifier();
        const idFound = input.scope.findObjectDefinition(identifier.getName());
        if (idFound instanceof InterfaceDefinition && type === undefined) {
          const message = "Interface reference, cannot be instantiated";
          input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
          return;
        } else if (found instanceof ObjectReferenceType
            && type === undefined
            && input.scope.findInterfaceDefinition(found.getQualifiedName())) {
          const message = "Interface reference, cannot be instantiated";
          input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
          return;
        } else if (idFound instanceof ClassDefinition && cdef === undefined) {
          cdef = idFound;
        }
        if (type === undefined && idFound instanceof ClassDefinition && idFound.isAbstract() === true) {
          const message = identifier.getName() + " is abstract, cannot be instantiated";
          input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
          return;
        }
      }

      if (found instanceof ObjectReferenceType && cdef === undefined) {
        cdef = input.scope.findClassDefinition(found.getQualifiedName());
      }
    }

    for (const t of node.findDirectExpressions(Expressions.Dynamic)) {
      Dynamic.runSyntax(t, input);
    }

    let ooName = cdef?.getName();
    if (ooName === undefined && found instanceof VoidType) {
      ooName = found.getVoided();
    }

    input.scope.addReference(t?.getFirstToken(), cdef, ReferenceType.ConstructorReference, input.filename,
                             {ooName: ooName});

    if (cdef !== undefined) {
      const err = CreateObject.checkInstantiationAllowed(cdef, input);
      if (err) {
        input.issues.push(syntaxIssue(input, node.getFirstToken(), err));
        return;
      }
    }

    this.validateParameters(cdef, node, input);
  }

  public static checkInstantiationAllowed(cdef: IClassDefinition, input: SyntaxInput): string | undefined {
    const createVis = cdef.getCreateVisibility();
    if (createVis === Visibility.Public) {
      return undefined;
    }
    const enclosingClass = input.scope.getEnclosingClassName();
    if (enclosingClass === undefined) {
      return cdef.getName() + " cannot be instantiated, class is defined as " +
        (createVis === Visibility.Private ? "private" : "protected");
    }
    if (enclosingClass.toUpperCase() === cdef.getName().toUpperCase()) {
      return undefined;
    }
    if (cdef.getFriends().some(f => f.toUpperCase() === enclosingClass.toUpperCase())) {
      return undefined;
    }
    if (createVis === Visibility.Protected) {
      // subclasses are also allowed
      let sup = input.scope.findClassDefinition(enclosingClass)?.getSuperClass();
      while (sup !== undefined) {
        if (sup.toUpperCase() === cdef.getName().toUpperCase()) {
          return undefined;
        }
        sup = input.scope.findClassDefinition(sup)?.getSuperClass();
      }
    }
    return cdef.getName() + " cannot be instantiated, class is defined as " +
      (createVis === Visibility.Private ? "private" : "protected");
  }

  private validateParameters(cdef: IClassDefinition | undefined, node: StatementNode, input: SyntaxInput): void {
    if (cdef === undefined) {
      const sources = node.findDirectExpression(Expressions.ParameterListS)?.findAllExpressions(Expressions.Source);
      for (const s of sources || []) {
        Source.runSyntax(s, input);
      }
      return;
    }

    const methodDef = new ObjectOriented(input.scope).searchMethodName(cdef, "CONSTRUCTOR");
    const methodParameters = methodDef.method?.getParameters();

    const allImporting = methodParameters?.getImporting() || [];
    const requiredImporting = new Set(methodParameters?.getRequiredParameters().map(i => i.getName().toUpperCase()));

    for (const p of node.findDirectExpression(Expressions.ParameterListS)?.findAllExpressions(Expressions.ParameterS) || []) {
      const name = p.findDirectExpression(Expressions.ParameterName)?.concatTokens().toUpperCase();
      if (name === undefined) {
        continue;
      }

      const source = p.findDirectExpression(Expressions.Source);
      const sourceType = Source.runSyntax(source, input);

      const found = allImporting?.find(p => p.getName().toUpperCase() === name);
      if (found === undefined) {
        const message = `constructor parameter "${name}" does not exist`;
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      } else if (new TypeUtils(input.scope).isAssignableStrict(sourceType, found.getType(), source) === false) {
        const message = `constructor parameter "${name}" type not compatible`;
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      }

      requiredImporting.delete(name);
    }

    for (const r of requiredImporting.values()) {
      const message = `constructor parameter "${r}" must be supplied`;
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return;
    }
  }
}