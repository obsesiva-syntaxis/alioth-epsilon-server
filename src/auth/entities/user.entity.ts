// import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Schema, SchemaFactory } from "@nestjs/mongoose";
import { Prop } from "@nestjs/mongoose/dist";
import { Document } from "mongoose";
const moment = require('moment-timezone');

@Schema()
export class User extends Document {
    @Prop({ unique: true, index: true, required: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop()
    fullname: string;

    @Prop({ default: true })
    active: boolean;

    @Prop({ type: [String], default: 'user' })
    roles: string[];

    @Prop({ type: Date, default: moment().tz("America/Santiago").format() })
    created_at: Date;

    @Prop({ type: Date, default: null })
    modified_at: Date;

    @Prop({ type: Date, default: null })
    deleted_at: Date;
}

export const UserSchema = SchemaFactory.createForClass( User );