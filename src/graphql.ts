
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export class HeaderInput {
    key: string;
    value: string;
}

export class ParamInput {
    key: string;
    value: string;
}

export class EnvVariableInput {
    key: string;
    value: string;
}

export class User {
    id: string;
    username: string;
    email: string;
    collections: Collection[];
}

export class Collection {
    id: string;
    name: string;
    description?: Nullable<string>;
    requests: Request[];
    owner: User;
    sharedWith?: Nullable<User[]>;
    isPublic: boolean;
    createdAt: string;
    updatedAt: string;
}

export class Request {
    id: string;
    name: string;
    method: string;
    url: string;
    headers?: Nullable<Header[]>;
    params?: Nullable<Param[]>;
    body?: Nullable<string>;
    responses?: Nullable<Response[]>;
    notes?: Nullable<string>;
    createdAt: string;
    updatedAt: string;
}

export class Header {
    key: string;
    value: string;
}

export class Param {
    key: string;
    value: string;
}

export class Response {
    id: string;
    statusCode: number;
    body: string;
    headers: Header[];
    timestamp: string;
}

export class Environment {
    id: string;
    name: string;
    variables: EnvVariable[];
    owner: User;
}

export class EnvVariable {
    key: string;
    value: string;
}

export class AuthPayload {
    token: string;
    user: User;
}

export abstract class IQuery {
    abstract me(): Nullable<User> | Promise<Nullable<User>>;

    abstract user(id: string): Nullable<User> | Promise<Nullable<User>>;

    abstract collection(id: string): Nullable<Collection> | Promise<Nullable<Collection>>;

    abstract collections(): Collection[] | Promise<Collection[]>;

    abstract request(id: string): Nullable<Request> | Promise<Nullable<Request>>;

    abstract requests(collectionId: string): Request[] | Promise<Request[]>;

    abstract environment(id: string): Nullable<Environment> | Promise<Nullable<Environment>>;

    abstract environments(): Environment[] | Promise<Environment[]>;

    abstract publicCollections(): Collection[] | Promise<Collection[]>;
}

export abstract class IMutation {
    abstract signup(username: string, email: string, password: string): AuthPayload | Promise<AuthPayload>;

    abstract login(email: string, password: string): AuthPayload | Promise<AuthPayload>;

    abstract createCollection(name: string, description?: Nullable<string>): Collection | Promise<Collection>;

    abstract updateCollection(id: string, name?: Nullable<string>, description?: Nullable<string>): Collection | Promise<Collection>;

    abstract deleteCollection(id: string): boolean | Promise<boolean>;

    abstract shareCollection(id: string, userEmail: string): Collection | Promise<Collection>;

    abstract makeCollectionPublic(id: string, isPublic: boolean): Collection | Promise<Collection>;

    abstract createRequest(collectionId: string, name: string, method: string, url: string, headers?: Nullable<HeaderInput[]>, params?: Nullable<ParamInput[]>, body?: Nullable<string>, notes?: Nullable<string>): Request | Promise<Request>;

    abstract updateRequest(id: string, name?: Nullable<string>, method?: Nullable<string>, url?: Nullable<string>, headers?: Nullable<Nullable<HeaderInput>[]>, params?: Nullable<Nullable<ParamInput>[]>, body?: Nullable<string>, notes?: Nullable<string>): Request | Promise<Request>;

    abstract deleteRequest(id: string): boolean | Promise<boolean>;

    abstract saveResponse(requestId: string, statusCode: number, body: string, headers: HeaderInput[]): Response | Promise<Response>;

    abstract deleteResponse(id: string): boolean | Promise<boolean>;

    abstract createEnvironment(name: string, variables?: Nullable<EnvVariableInput[]>): Environment | Promise<Environment>;

    abstract updateEnvironment(id: string, name?: Nullable<string>, variables?: Nullable<EnvVariableInput[]>): Environment | Promise<Environment>;

    abstract deleteEnvironment(id: string): boolean | Promise<boolean>;
}

type Nullable<T> = T | null;
