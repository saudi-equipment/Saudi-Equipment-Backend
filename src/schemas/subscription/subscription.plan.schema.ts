import { Prop, Schema } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { User } from "../user/user.schema";

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
    
    @Prop({ type: Types.ObjectId, ref: 'User', required: false })
    user?: User;
    
}
