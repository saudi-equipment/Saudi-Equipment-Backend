import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, Document } from "mongoose";
import { User } from "../user/user.schema";
import { Subscription } from "./subscription.schema";

@Schema({ timestamps: true })
export class SubscriptionPlan extends Document {
    @Prop({ required: false })
    subscriptionName: string;           

    @Prop({ required: false })
    plan: string;

    @Prop({ required: false })
    price: number;
    
    @Prop({ required: false })
    currency: string;

    @Prop({ required: false })
    duration: string;
    
    @Prop({ type: String, enum: ['active', 'inactive'], default: 'active' })
    subscriptionStatus: string;
    
    @Prop({ required: false })
    createdBy: string;
    
    @Prop({ type: Types.ObjectId, ref: 'User', required: false })
    user: User;

    @Prop({ type: Types.ObjectId, ref: 'Subscription', required: false })
    subscription: Subscription;

}

export const subscriptionPlanSchema = SchemaFactory.createForClass(SubscriptionPlan);
