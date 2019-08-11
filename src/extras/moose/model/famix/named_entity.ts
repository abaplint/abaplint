// automatically generated code, please do not change

import {FamixMseExporter} from "../../famix_mse_exporter";
import {Invocation} from "./../famix/invocation";
import {SourcedEntity} from "./../famix/sourced_entity";
import {Package} from "./../famix/package";
import {AnnotationInstance} from "./../famix/annotation_instance";


export class NamedEntity extends SourcedEntity {


  private namedEntityReceivingInvocations: Set<Invocation> = new Set();

  // manyOne.Getter
  // @FameProperty(name = "receivingInvocations", opposite = "receiver", derived = true)
  public getReceivingInvocations(): Set<Invocation> {
    return this.namedEntityReceivingInvocations;
  }

  // manyOne.Setter
  public addReceivingInvocations(namedEntityReceivingInvocations: Invocation) {
    if (!this.namedEntityReceivingInvocations.has(namedEntityReceivingInvocations)) {
      this.namedEntityReceivingInvocations.add(namedEntityReceivingInvocations);
      namedEntityReceivingInvocations.setReceiver(this);
    }
  }

  private namedEntityModifiers: Set<String> = new Set();

  // @FameProperty(name = "modifiers")
  // many.getter
  public getModifiers(): Set<String> {
    return this.namedEntityModifiers;
  }

  // many.Setter
  public addModifiers(newModifiers: String) {
    if (!this.namedEntityModifiers.has(newModifiers)) {
      this.namedEntityModifiers.add(newModifiers);
    }
  }

  private namedEntityIsStub: Boolean;

  // @FameProperty(name = "isStub")
  public getIsStub(): Boolean {
    return this.namedEntityIsStub;
  }

  public setIsStub(namedEntityIsStub: Boolean) {
    this.namedEntityIsStub = namedEntityIsStub;
  }

  private namedEntityName: String;

  // @FameProperty(name = "name")
  public getName(): String {
    return this.namedEntityName;
  }

  public setName(namedEntityName: String) {
    this.namedEntityName = namedEntityName;
  }

  private namedEntityAnnotationInstances: Set<AnnotationInstance> = new Set();

  // manyOne.Getter
  // @FameProperty(name = "annotationInstances", opposite = "annotatedEntity", derived = true)
  public getAnnotationInstances(): Set<AnnotationInstance> {
    return this.namedEntityAnnotationInstances;
  }

  // manyOne.Setter
  public addAnnotationInstances(namedEntityAnnotationInstances: AnnotationInstance) {
    if (!this.namedEntityAnnotationInstances.has(namedEntityAnnotationInstances)) {
      this.namedEntityAnnotationInstances.add(namedEntityAnnotationInstances);
      namedEntityAnnotationInstances.setAnnotatedEntity(this);
    }
  }

  private namedEntityParentPackage: Package;

  // oneMany.Getter
  // @FameProperty(name = "parentPackage", opposite = "childNamedEntities")
  public getParentPackage(): Package {
    return this.namedEntityParentPackage;
  }

  // oneMany.Setter
  public setParentPackage(newParentPackage: Package) {
    this.namedEntityParentPackage = newParentPackage;
    newParentPackage.getChildNamedEntities().add(this);
  }



  public getMSE(): string {
    const mse: FamixMseExporter = new FamixMseExporter("FAMIX.NamedEntity", this);
    this.addPropertiesToExporter(mse);
    return mse.getMSE();
  }

  public addPropertiesToExporter(exporter: FamixMseExporter) {
    super.addPropertiesToExporter(exporter);
    exporter.addProperty("isStub", this.getIsStub());
    exporter.addProperty("receivingInvocations", this.getReceivingInvocations());
    exporter.addProperty("name", this.getName());
    exporter.addProperty("modifiers", this.getModifiers());
    exporter.addProperty("annotationInstances", this.getAnnotationInstances());
    exporter.addProperty("parentPackage", this.getParentPackage());

  }

}

