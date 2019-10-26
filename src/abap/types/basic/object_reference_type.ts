import {AbstractType} from "./_abstract_type";

export class ObjectReferenceType extends AbstractType {
  private readonly name: string;

  public constructor(name: string) {
    super();
    this.name = name;
  }

  public getName() {
    return this.name;
  }

  public toText() {
    return "```REF TO " + this.name + "```";
  }

}