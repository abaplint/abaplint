// automatically generated code, please do not change

import {FamixMseExporter} from "../../famix_mse_exporter";
import {DereferencedInvocation} from "./../famix/dereferenced_invocation";
import {Type} from "./../famix/type";
import {Access} from "./../famix/access";
import {LeafEntity} from "./../famix/leaf_entity";


export class StructuralEntity extends LeafEntity {


  private structuralEntityIncomingAccesses: Set<Access> = new Set();

  // manyOne.Getter
  // @FameProperty(name = "incomingAccesses", opposite = "variable", derived = true)
  public getIncomingAccesses(): Set<Access> {
    return this.structuralEntityIncomingAccesses;
  }

  // manyOne.Setter
  public addIncomingAccesses(structuralEntityIncomingAccesses: Access) {
    if (!this.structuralEntityIncomingAccesses.has(structuralEntityIncomingAccesses)) {
      this.structuralEntityIncomingAccesses.add(structuralEntityIncomingAccesses);
      structuralEntityIncomingAccesses.setVariable(this);
    }
  }

  private structuralEntityDeclaredType: Type;

  // oneMany.Getter
  // @FameProperty(name = "declaredType", opposite = "structuresWithDeclaredType")
  public getDeclaredType(): Type {
    return this.structuralEntityDeclaredType;
  }

  // oneMany.Setter
  public setDeclaredType(newDeclaredType: Type) {
    this.structuralEntityDeclaredType = newDeclaredType;
    newDeclaredType.getStructuresWithDeclaredType().add(this);
  }

  private structuralEntityDereferencedInvocations: Set<DereferencedInvocation> = new Set();

  // manyOne.Getter
  // @FameProperty(name = "dereferencedInvocations", opposite = "referencer", derived = true)
  public getDereferencedInvocations(): Set<DereferencedInvocation> {
    return this.structuralEntityDereferencedInvocations;
  }

  // manyOne.Setter
  public addDereferencedInvocations(structuralEntityDereferencedInvocations: DereferencedInvocation) {
    if (!this.structuralEntityDereferencedInvocations.has(structuralEntityDereferencedInvocations)) {
      this.structuralEntityDereferencedInvocations.add(structuralEntityDereferencedInvocations);
      structuralEntityDereferencedInvocations.setReferencer(this);
    }
  }



  public getMSE(): string {
    const mse: FamixMseExporter = new FamixMseExporter("FAMIX.StructuralEntity", this);
    this.addPropertiesToExporter(mse);
    return mse.getMSE();
  }

  public addPropertiesToExporter(exporter: FamixMseExporter) {
    super.addPropertiesToExporter(exporter);
    exporter.addProperty("incomingAccesses", this.getIncomingAccesses());
    exporter.addProperty("declaredType", this.getDeclaredType());
    exporter.addProperty("dereferencedInvocations", this.getDereferencedInvocations());

  }

}

