interface LoginUserPayloadT {
  email: string | undefined;
  username: string | undefined;
  password: string;
}

interface SignupUserPayloadT {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

interface ResendEmailVerificationPayloadT {
  email: string;
}

interface StartNewStreamPayloadT {
  title: string;
  youtubeVideoUrl: string;
}

interface VerifyEmailPayloadT {
  verificationToken: string;
}

interface GetAllStreamsPayloadT {
  page?: number;
  limit?: number;
}

interface ApplyForStreamerPayloadT {
  city: string;
  state: string;
  postalCode: string;
  bankAccountNumber: string;
  bankIfsc: string;
  phoneNumber: string;
  streetAddress: string;
  youtubeChannelName: string;
  authToken: string;
}

interface GetStreamByIdPayloadT {
  streamId: string;
}

interface MakePremiumChatOrderPayloadT {
  streamId: string;
  message: string;
  paymentAmount: number;
}

interface SSOGoogleAuthPayloadT {
  credential: string;
  clientId: string;
  select_by: string;
}

export type {
  LoginUserPayloadT,
  SignupUserPayloadT,
  ResendEmailVerificationPayloadT,
  StartNewStreamPayloadT,
  VerifyEmailPayloadT,
  GetAllStreamsPayloadT,
  ApplyForStreamerPayloadT,
  GetStreamByIdPayloadT,
  MakePremiumChatOrderPayloadT,
  SSOGoogleAuthPayloadT
};
