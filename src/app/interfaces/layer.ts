export interface Layer {
    id: number;
    name: string;
    zHeight: number;
    points: Array<[number, number]>;
    draggingPoint: [number,number] | null;
    editing?: boolean;
    previousName?: string;
}
