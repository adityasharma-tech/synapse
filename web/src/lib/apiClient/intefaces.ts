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
    title:  string
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
    vpa?: string;
    bankAccountNumber?: string;
    bankIfsc?: string;
    phoneNumber: string;
    countryCode: string;
    streetAddress: string;
  }

  interface GetStreamByIdPayloadT
  {
    streamId: string;
  }

export type {
    LoginUserPayloadT,
    SignupUserPayloadT,
    ResendEmailVerificationPayloadT,
    StartNewStreamPayloadT,
    VerifyEmailPayloadT,
    GetAllStreamsPayloadT,
    ApplyForStreamerPayloadT,
    GetStreamByIdPayloadT
}