// automatically generated code, please do not change

import {FamixMseExporter} from "../../famix_mse_exporter";
import {StructuralEntity} from "./../famix/structural_entity";
import {ParameterizedType} from "./../famix/parameterized_type";
import {BehaviouralEntity} from "./../famix/behavioural_entity";
import {ContainerEntity} from "./../famix/container_entity";
import {Attribute} from "./../famix/attribute";
import {Reference} from "./../famix/reference";
import {Inheritance} from "./../famix/inheritance";
import {TypeAlias} from "./../famix/type_alias";
import {Method} from "./../famix/method";


export class Type extends ContainerEntity {


  private typeContainer: ContainerEntity;

  // oneMany.Getter
  // @FameProperty(name = "container", opposite = "types")
  public getContainer(): ContainerEntity {
    return this.typeContainer;
  }

  // oneMany.Setter
  public setContainer(newContainer: ContainerEntity) {
    this.typeContainer = newContainer;
    newContainer.getTypes().add(this);
  }

  private typeIncomingReferences: Set<Reference> = new Set();

  // manyOne.Getter
  // @FameProperty(name = "incomingReferences", opposite = "target", derived = true)
  public getIncomingReferences(): Set<Reference> {
    return this.typeIncomingReferences;
  }

  // manyOne.Setter
  public addIncomingReferences(typeIncomingReferences: Reference) {
    if (!this.typeIncomingReferences.has(typeIncomingReferences)) {
      this.typeIncomingReferences.add(typeIncomingReferences);
      typeIncomingReferences.setTarget(this);
    }
  }

  private typeStructuresWithDeclaredType: Set<StructuralEntity> = new Set();

  // manyOne.Getter
  // @FameProperty(name = "structuresWithDeclaredType", opposite = "declaredType", derived = true)
  public getStructuresWithDeclaredType(): Set<StructuralEntity> {
    return this.typeStructuresWithDeclaredType;
  }

  // manyOne.Setter
  public addStructuresWithDeclaredType(typeStructuresWithDeclaredType: StructuralEntity) {
    if (!this.typeStructuresWithDeclaredType.has(typeStructuresWithDeclaredType)) {
      this.typeStructuresWithDeclaredType.add(typeStructuresWithDeclaredType);
      typeStructuresWithDeclaredType.setDeclaredType(this);
    }
  }

  private typeTypeAliases: Set<TypeAlias> = new Set();

  // manyOne.Getter
  // @FameProperty(name = "typeAliases", opposite = "aliasedType", derived = true)
  public getTypeAliases(): Set<TypeAlias> {
    return this.typeTypeAliases;
  }

  // manyOne.Setter
  public addTypeAliases(typeTypeAliases: TypeAlias) {
    if (!this.typeTypeAliases.has(typeTypeAliases)) {
      this.typeTypeAliases.add(typeTypeAliases);
      typeTypeAliases.setAliasedType(this);
    }
  }

  private typeSuperInheritances: Set<Inheritance> = new Set();

  // manyOne.Getter
  // @FameProperty(name = "superInheritances", opposite = "subclass", derived = true)
  public getSuperInheritances(): Set<Inheritance> {
    return this.typeSuperInheritances;
  }

  // manyOne.Setter
  public addSuperInheritances(typeSuperInheritances: Inheritance) {
    if (!this.typeSuperInheritances.has(typeSuperInheritances)) {
      this.typeSuperInheritances.add(typeSuperInheritances);
      typeSuperInheritances.setSubclass(this);
    }
  }

  private typeSubInheritances: Set<Inheritance> = new Set();

  // manyOne.Getter
  // @FameProperty(name = "subInheritances", opposite = "superclass", derived = true)
  public getSubInheritances(): Set<Inheritance> {
    return this.typeSubInheritances;
  }

  // manyOne.Setter
  public addSubInheritances(typeSubInheritances: Inheritance) {
    if (!this.typeSubInheritances.has(typeSubInheritances)) {
      this.typeSubInheritances.add(typeSubInheritances);
      typeSubInheritances.setSuperclass(this);
    }
  }

  private typeBehavioursWithDeclaredType: Set<BehaviouralEntity> = new Set();

  // manyOne.Getter
  // @FameProperty(name = "behavioursWithDeclaredType", opposite = "declaredType", derived = true)
  public getBehavioursWithDeclaredType(): Set<BehaviouralEntity> {
    return this.typeBehavioursWithDeclaredType;
  }

  // manyOne.Setter
  public addBehavioursWithDeclaredType(typeBehavioursWithDeclaredType: BehaviouralEntity) {
    if (!this.typeBehavioursWithDeclaredType.has(typeBehavioursWithDeclaredType)) {
      this.typeBehavioursWithDeclaredType.add(typeBehavioursWithDeclaredType);
      typeBehavioursWithDeclaredType.setDeclaredType(this);
    }
  }

  private typeMethods: Set<Method> = new Set();

  // manyOne.Getter
  // @FameProperty(name = "methods", opposite = "parentType", derived = true)
  public getMethods(): Set<Method> {
    return this.typeMethods;
  }

  // manyOne.Setter
  public addMethods(typeMethods: Method) {
    if (!this.typeMethods.has(typeMethods)) {
      this.typeMethods.add(typeMethods);
      typeMethods.setParentType(this);
    }
  }

  private typeAttributes: Set<Attribute> = new Set();

  // manyOne.Getter
  // @FameProperty(name = "attributes", opposite = "parentType", derived = true)
  public getAttributes(): Set<Attribute> {
    return this.typeAttributes;
  }

  // manyOne.Setter
  public addAttributes(typeAttributes: Attribute) {
    if (!this.typeAttributes.has(typeAttributes)) {
      this.typeAttributes.add(typeAttributes);
      typeAttributes.setParentType(this);
    }
  }

  private typeArgumentsInParameterizedTypes: Set<ParameterizedType> = new Set();

  // manyMany.Getter
  // @FameProperty(name = "argumentsInParameterizedTypes", opposite = "arguments", derived = true)
  public getArgumentsInParameterizedTypes(): Set<ParameterizedType> {
    return this.typeArgumentsInParameterizedTypes;
  }

  // manyMany.Setter
  public addArgumentsInParameterizedTypes(newArgumentsInParameterizedTypes: ParameterizedType) {
    if (!this.typeArgumentsInParameterizedTypes.has(newArgumentsInParameterizedTypes)) {
      this.typeArgumentsInParameterizedTypes.add(newArgumentsInParameterizedTypes);
      newArgumentsInParameterizedTypes.getArguments().add(this);
    }
  }



  public getMSE(): string {
    const mse: FamixMseExporter = new FamixMseExporter("FAMIX.Type", this);
    this.addPropertiesToExporter(mse);
    return mse.getMSE();
  }

  public addPropertiesToExporter(exporter: FamixMseExporter) {
    super.addPropertiesToExporter(exporter);
    exporter.addProperty("container", this.getContainer());
    exporter.addProperty("typeAliases", this.getTypeAliases());
    exporter.addProperty("superInheritances", this.getSuperInheritances());
    exporter.addProperty("subInheritances", this.getSubInheritances());
    exporter.addProperty("behavioursWithDeclaredType", this.getBehavioursWithDeclaredType());
    exporter.addProperty("structuresWithDeclaredType", this.getStructuresWithDeclaredType());
    exporter.addProperty("methods", this.getMethods());
    exporter.addProperty("attributes", this.getAttributes());
    exporter.addProperty("argumentsInParameterizedTypes", this.getArgumentsInParameterizedTypes());
    exporter.addProperty("incomingReferences", this.getIncomingReferences());

  }

}

