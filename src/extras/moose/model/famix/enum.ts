// automatically generated code, please do not change

import {FamixMseExporter} from "../../famix_mse_exporter";
import {Type} from "./../famix/type";
import {EnumValue} from "./../famix/enum_value";


export class Enum extends Type {


  private enumValues: Set<EnumValue> = new Set();

  // manyOne.Getter
  // @FameProperty(name = "values", opposite = "parentEnum", derived = true)
  public getValues(): Set<EnumValue> {
    return this.enumValues;
  }

  // manyOne.Setter
  public addValues(enumValues: EnumValue) {
    if (!this.enumValues.has(enumValues)) {
      this.enumValues.add(enumValues);
      enumValues.setParentEnum(this);
    }
  }



  public getMSE(): string {
    const mse: FamixMseExporter = new FamixMseExporter("FAMIX.Enum", this);
    this.addPropertiesToExporter(mse);
    return mse.getMSE();
  }

  public addPropertiesToExporter(exporter: FamixMseExporter) {
    super.addPropertiesToExporter(exporter);
    exporter.addProperty("values", this.getValues());

  }

}

