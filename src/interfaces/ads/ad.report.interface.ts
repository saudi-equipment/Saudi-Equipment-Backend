import { User } from "aws-sdk/clients/budgets";

export interface IReportAd {
    reportedBy: string;
    subject: string;
    message: string;
    user: User
  }
  