import {AbstractObject} from "./_abstract_object";

export class CDSMetadataExtension extends AbstractObject {

  public getType(): string {
    return "DDLX";
  }

  public getAllowedNaming() {
    return {
      maxLength: 40,
      allowNamespace: true,
    };
  }
}
