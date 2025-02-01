import { OtpContext, OtpType } from 'src/enums';

export interface IOtp {
  id: string,
  code: string;
  phoneNumber: string,
  isUsed: boolean;
  isExpired: boolean;
  expireTime: string;
  context: OtpContext;
  otpType: OtpType;
  ipAddress?: string;
  deviceInfo?: string;
  resendCount?: number;
  isBlacklisted?: boolean;
  generatedDate?: Date;
  retryAttempts?: number;
}
