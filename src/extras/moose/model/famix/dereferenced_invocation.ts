// automatically generated code, please do not change

import {FamixMseExporter} from "../../famix_mse_exporter";
import {StructuralEntity} from "./../famix/structural_entity";
import {Invocation} from "./../famix/invocation";


export class DereferencedInvocation extends Invocation {


  private dereferencedInvocationReferencer: StructuralEntity;

  // oneMany.Getter
  // @FameProperty(name = "referencer", opposite = "dereferencedInvocations")
  public getReferencer(): StructuralEntity {
    return this.dereferencedInvocationReferencer;
  }

  // oneMany.Setter
  public setReferencer(newReferencer: StructuralEntity) {
    this.dereferencedInvocationReferencer = newReferencer;
    newReferencer.getDereferencedInvocations().add(this);
  }



  public getMSE(): string {
    const mse: FamixMseExporter = new FamixMseExporter("FAMIX.DereferencedInvocation", this);
    this.addPropertiesToExporter(mse);
    return mse.getMSE();
  }

  public addPropertiesToExporter(exporter: FamixMseExporter) {
    super.addPropertiesToExporter(exporter);
    exporter.addProperty("referencer", this.getReferencer());

  }

}

