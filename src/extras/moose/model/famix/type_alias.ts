// automatically generated code, please do not change

import {FamixMseExporter} from "../../famix_mse_exporter";
import {Type} from "./../famix/type";


export class TypeAlias extends Type {


  private typeAliasAliasedType: Type;

  // oneMany.Getter
  // @FameProperty(name = "aliasedType", opposite = "typeAliases")
  public getAliasedType(): Type {
    return this.typeAliasAliasedType;
  }

  // oneMany.Setter
  public setAliasedType(newAliasedType: Type) {
    this.typeAliasAliasedType = newAliasedType;
    newAliasedType.getTypeAliases().add(this);
  }



  public getMSE(): string {
    const mse: FamixMseExporter = new FamixMseExporter("FAMIX.TypeAlias", this);
    this.addPropertiesToExporter(mse);
    return mse.getMSE();
  }

  public addPropertiesToExporter(exporter: FamixMseExporter) {
    super.addPropertiesToExporter(exporter);
    exporter.addProperty("aliasedType", this.getAliasedType());

  }

}

