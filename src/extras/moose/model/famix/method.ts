// automatically generated code, please do not change

import {FamixMseExporter} from "../../famix_mse_exporter";
import {CaughtException} from "./../famix/caught_exception";
import {DeclaredException} from "./../famix/declared_exception";
import {Type} from "./../famix/type";
import {BehaviouralEntity} from "./../famix/behavioural_entity";
import {ThrownException} from "./../famix/thrown_exception";


export class Method extends BehaviouralEntity {


  private methodKind: String;

  // @FameProperty(name = "kind")
  public getKind(): String {
    return this.methodKind;
  }

  public setKind(methodKind: String) {
    this.methodKind = methodKind;
  }

  private methodThrownExceptions: Set<ThrownException> = new Set();

  // manyOne.Getter
  // @FameProperty(name = "thrownExceptions", opposite = "definingMethod", derived = true)
  public getThrownExceptions(): Set<ThrownException> {
    return this.methodThrownExceptions;
  }

  // manyOne.Setter
  public addThrownExceptions(methodThrownExceptions: ThrownException) {
    if (!this.methodThrownExceptions.has(methodThrownExceptions)) {
      this.methodThrownExceptions.add(methodThrownExceptions);
      methodThrownExceptions.setDefiningMethod(this);
    }
  }

  private methodCaughtExceptions: Set<CaughtException> = new Set();

  // manyOne.Getter
  // @FameProperty(name = "caughtExceptions", opposite = "definingMethod", derived = true)
  public getCaughtExceptions(): Set<CaughtException> {
    return this.methodCaughtExceptions;
  }

  // manyOne.Setter
  public addCaughtExceptions(methodCaughtExceptions: CaughtException) {
    if (!this.methodCaughtExceptions.has(methodCaughtExceptions)) {
      this.methodCaughtExceptions.add(methodCaughtExceptions);
      methodCaughtExceptions.setDefiningMethod(this);
    }
  }

  private methodHasClassScope: Boolean;

  // @FameProperty(name = "hasClassScope")
  public getHasClassScope(): Boolean {
    return this.methodHasClassScope;
  }

  public setHasClassScope(methodHasClassScope: Boolean) {
    this.methodHasClassScope = methodHasClassScope;
  }

  private methodParentType: Type;

  // oneMany.Getter
  // @FameProperty(name = "parentType", opposite = "methods")
  public getParentType(): Type {
    return this.methodParentType;
  }

  // oneMany.Setter
  public setParentType(newParentType: Type) {
    this.methodParentType = newParentType;
    newParentType.getMethods().add(this);
  }

  private methodTimeStamp: String;

  // @FameProperty(name = "timeStamp")
  public getTimeStamp(): String {
    return this.methodTimeStamp;
  }

  public setTimeStamp(methodTimeStamp: String) {
    this.methodTimeStamp = methodTimeStamp;
  }

  private methodDeclaredExceptions: Set<DeclaredException> = new Set();

  // manyOne.Getter
  // @FameProperty(name = "declaredExceptions", opposite = "definingMethod", derived = true)
  public getDeclaredExceptions(): Set<DeclaredException> {
    return this.methodDeclaredExceptions;
  }

  // manyOne.Setter
  public addDeclaredExceptions(methodDeclaredExceptions: DeclaredException) {
    if (!this.methodDeclaredExceptions.has(methodDeclaredExceptions)) {
      this.methodDeclaredExceptions.add(methodDeclaredExceptions);
      methodDeclaredExceptions.setDefiningMethod(this);
    }
  }

  private methodCategory: String;

  // @FameProperty(name = "category")
  public getCategory(): String {
    return this.methodCategory;
  }

  public setCategory(methodCategory: String) {
    this.methodCategory = methodCategory;
  }



  public getMSE(): string {
    const mse: FamixMseExporter = new FamixMseExporter("FAMIX.Method", this);
    this.addPropertiesToExporter(mse);
    return mse.getMSE();
  }

  public addPropertiesToExporter(exporter: FamixMseExporter) {
    super.addPropertiesToExporter(exporter);
    exporter.addProperty("timeStamp", this.getTimeStamp());
    exporter.addProperty("kind", this.getKind());
    exporter.addProperty("thrownExceptions", this.getThrownExceptions());
    exporter.addProperty("caughtExceptions", this.getCaughtExceptions());
    exporter.addProperty("declaredExceptions", this.getDeclaredExceptions());
    exporter.addProperty("hasClassScope", this.getHasClassScope());
    exporter.addProperty("category", this.getCategory());
    exporter.addProperty("parentType", this.getParentType());

  }

}

