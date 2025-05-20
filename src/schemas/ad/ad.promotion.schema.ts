import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { User } from "../user/user.schema";
import { Ad } from "./ad.schema";

@Schema({ timestamps: true })
export class AdPromotion extends Document {
    @Prop({ required: true })
    adId: string;

    @Prop({ required: false })
    promotionPrice: string;
  
    @Prop({ required: true })
    currency: string;
  
    @Prop({ required: false, enum: ['7days', '15days', '30days'] })
    promotionPlan: string;
  
    @Prop({ type: Date, required: false })
    promotionStartDate: Date;

    @Prop({ type: Date, required: false })
    promotionEndDate: Date;

    @Prop({ required: true })
    promotedBy: string;
     
    @Prop({ type: Types.ObjectId, ref: 'User', required: false })
    user: User[];

    @Prop({ type: Types.ObjectId, ref: 'Ad', required: false })
    ad: Ad;
}
 
export const adPromotionSchema = SchemaFactory.createForClass(AdPromotion);
