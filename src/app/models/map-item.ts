export interface MapNode {
    id: string;
    title: string;
    isRoot: boolean;
    css?: string;
    parentId?: string | undefined;
    children: MapNode[];
    position: 'left' | 'right' | 'center';
    isFirstLevel: boolean;
    isNew: boolean;
    notes?: string;
    temp?: boolean;
    uniqueIdentifier?: string | null | undefined;
}