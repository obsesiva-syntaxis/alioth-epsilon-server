import { User } from "../entities/user.entity";

export interface UserDocument extends Document {
    _id: string,
    email: string;
    password?: string;
    fullname: string;
    roles: [],
    created_at: string;
    modified_at?: string;
    deleted_at?: string;
    __v: number;
}

export interface LoginResponse {
    token: string;
    user: User
}