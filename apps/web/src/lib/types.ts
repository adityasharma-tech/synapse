import { userRolesEnum } from "@pkgs/drizzle-client";
interface UserT {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    profilePicture?: string;
    phoneNumber: string;
    role: (typeof userRolesEnum.enumValues)[number];
    emailVerified: boolean;
}

interface ServerResT {
    statusCode: number;
    data: any;
    message: string;
    success: boolean;
}

interface ServerErrResponseT {
    statusCode: number;
    data?: any;
    message: string;
    success: boolean;
    errType: string;
    errors?: any[];
}

export type { UserT, ServerErrResponseT, ServerResT };
