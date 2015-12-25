export default class Report {
    private texts: Array<string> = [];

    public add(text: string) {
        this.texts.push(text);
    }

    public get_count(): number {
        return this.texts.length;
    }
}