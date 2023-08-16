import { JwtPayload } from '.';

export type JwtPayloadWithRt = JwtPayload & {
  refreshTokens: string[];
};
