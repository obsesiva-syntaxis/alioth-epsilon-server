import { Schema, SchemaFactory } from "@nestjs/mongoose";
import { Prop } from "@nestjs/mongoose/dist";
import mongoose, { Document } from "mongoose";
import { User } from "./user.entity";
const moment = require('moment-timezone');


@Schema()
export class UserLog extends Document {

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    user: User;

    @Prop({ unique: true })
    email: string;

    @Prop()
    token: string;

    @Prop([String])
    roles: string[];

    @Prop({ type: Date, default: moment().tz("America/Santiago").format() })
    logged_at: Date;
}

export const UserLogSchema = SchemaFactory.createForClass( UserLog );