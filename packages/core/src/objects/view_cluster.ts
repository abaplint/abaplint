import {AbstractObject} from "./_abstract_object";

export class ViewCluster extends AbstractObject {

  public getType(): string {
    return "VCLS";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }
}