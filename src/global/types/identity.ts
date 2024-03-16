export type BfsId = string | number;

export interface UserType {
    id: BfsId;
    name: string | null;
    provider: string;
    email: string | null;
    imageUrl: string | null;
    roles: string[];
}
