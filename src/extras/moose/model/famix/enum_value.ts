// automatically generated code, please do not change

import {FamixMseExporter} from "../../famix_mse_exporter";
import {StructuralEntity} from "./../famix/structural_entity";
import {Enum} from "./../famix/enum";


export class EnumValue extends StructuralEntity {


  private enumValueParentEnum: Enum;

  // oneMany.Getter
  // @FameProperty(name = "parentEnum", opposite = "values")
  public getParentEnum(): Enum {
    return this.enumValueParentEnum;
  }

  // oneMany.Setter
  public setParentEnum(newParentEnum: Enum) {
    this.enumValueParentEnum = newParentEnum;
    newParentEnum.getValues().add(this);
  }



  public getMSE(): string {
    const mse: FamixMseExporter = new FamixMseExporter("FAMIX.EnumValue", this);
    this.addPropertiesToExporter(mse);
    return mse.getMSE();
  }

  public addPropertiesToExporter(exporter: FamixMseExporter) {
    super.addPropertiesToExporter(exporter);
    exporter.addProperty("parentEnum", this.getParentEnum());

  }

}

