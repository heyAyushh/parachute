import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { sessionOptions } from "../../lib/withSession";

export type User = {
  id: string | boolean;
  // admin?: boolean;
  address?: string | boolean;
};

export default withIronSessionApiRoute(logoutRoute, sessionOptions);

async function logoutRoute(req: NextApiRequest, res: NextApiResponse<User>) {
  req.session.destroy();

  res.json({
      id: false,
      // admin?: boolean;
      address: false,
  });
}