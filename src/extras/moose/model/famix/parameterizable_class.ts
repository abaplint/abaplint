// automatically generated code, please do not change

import {FamixMseExporter} from "../../famix_mse_exporter";
import {ParameterizedType} from "./../famix/parameterized_type";
import {Class} from "./../famix/class";


export class ParameterizableClass extends Class {


  private parameterizableClassParameterizedTypes: Set<ParameterizedType> = new Set();

  // manyOne.Getter
  // @FameProperty(name = "parameterizedTypes", opposite = "parameterizableClass", derived = true)
  public getParameterizedTypes(): Set<ParameterizedType> {
    return this.parameterizableClassParameterizedTypes;
  }

  // manyOne.Setter
  public addParameterizedTypes(parameterizableClassParameterizedTypes: ParameterizedType) {
    if (!this.parameterizableClassParameterizedTypes.has(parameterizableClassParameterizedTypes)) {
      this.parameterizableClassParameterizedTypes.add(parameterizableClassParameterizedTypes);
      parameterizableClassParameterizedTypes.setParameterizableClass(this);
    }
  }



  public getMSE(): string {
    const mse: FamixMseExporter = new FamixMseExporter("FAMIX.ParameterizableClass", this);
    this.addPropertiesToExporter(mse);
    return mse.getMSE();
  }

  public addPropertiesToExporter(exporter: FamixMseExporter) {
    super.addPropertiesToExporter(exporter);
    exporter.addProperty("parameterizedTypes", this.getParameterizedTypes());

  }

}

