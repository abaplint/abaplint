// automatically generated code, please do not change

import {FamixMseExporter} from "../../famix_mse_exporter";
import {Type} from "./../famix/type";
import {ParameterizableClass} from "./../famix/parameterizable_class";


export class ParameterizedType extends Type {


  private parameterizedTypeParameterizableClass: ParameterizableClass;

  // oneMany.Getter
  // @FameProperty(name = "parameterizableClass", opposite = "parameterizedTypes")
  public getParameterizableClass(): ParameterizableClass {
    return this.parameterizedTypeParameterizableClass;
  }

  // oneMany.Setter
  public setParameterizableClass(newParameterizableClass: ParameterizableClass) {
    this.parameterizedTypeParameterizableClass = newParameterizableClass;
    newParameterizableClass.getParameterizedTypes().add(this);
  }

  private parameterizedTypeArguments: Set<Type> = new Set();

  // manyMany.Getter
  // @FameProperty(name = "arguments", opposite = "argumentsInParameterizedTypes")
  public getArguments(): Set<Type> {
    return this.parameterizedTypeArguments;
  }

  // manyMany.Setter
  public addArguments(newArguments: Type) {
    if (!this.parameterizedTypeArguments.has(newArguments)) {
      this.parameterizedTypeArguments.add(newArguments);
      newArguments.getArgumentsInParameterizedTypes().add(this);
    }
  }



  public getMSE(): string {
    const mse: FamixMseExporter = new FamixMseExporter("FAMIX.ParameterizedType", this);
    this.addPropertiesToExporter(mse);
    return mse.getMSE();
  }

  public addPropertiesToExporter(exporter: FamixMseExporter) {
    super.addPropertiesToExporter(exporter);
    exporter.addProperty("parameterizableClass", this.getParameterizableClass());
    exporter.addProperty("arguments", this.getArguments());

  }

}

