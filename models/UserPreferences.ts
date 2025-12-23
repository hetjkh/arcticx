import { ObjectId } from "mongodb";

export interface UserPreferences {
    _id?: ObjectId;
    userId: ObjectId;
    columnNames?: {
        passengerName?: string;
        route?: string;
        airlines?: string;
        serviceType?: string;
        amount?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

